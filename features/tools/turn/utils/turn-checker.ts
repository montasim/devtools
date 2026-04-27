import type { IceCandidateInfo } from '../../stun/utils/stun-checker';

export { type IceCandidateInfo } from '../../stun/utils/stun-checker';

export interface TurnResult {
    turnUrl: string;
    username: string;
    timestamp: number;
    success: boolean;
    responseTime: number;
    publicIps: string[];
    relayIps: string[];
    candidates: IceCandidateInfo[];
    error: string | null;
    localIps: string[];
    allocationSuccess: boolean;
}

export const DEFAULT_TURN_SERVERS = [
    {
        url: 'turn:openrelay.metered.ca:80',
        username: 'openrelayproject',
        credential: 'openrelayproject',
    },
    {
        url: 'turn:openrelay.metered.ca:443',
        username: 'openrelayproject',
        credential: 'openrelayproject',
    },
    {
        url: 'turn:openrelay.metered.ca:443?transport=tcp',
        username: 'openrelayproject',
        credential: 'openrelayproject',
    },
];

function parseCandidate(candidate: string): IceCandidateInfo {
    const parts = candidate.split(' ');

    const type = (parts.length > 7 ? parts[7] : 'unknown') as IceCandidateInfo['type'];
    const protocol = (parts.length > 2 ? parts[2] : 'unknown') as IceCandidateInfo['protocol'];
    const ip = parts.length > 4 ? parts[4] : '';
    const port = parts.length > 5 ? parseInt(parts[5], 10) : 0;
    const priority = parts.length > 3 ? parseInt(parts[3], 10) : null;
    const foundation = parts.length > 0 ? parts[0] : null;
    const component =
        parts.length > 1
            ? parts[1] === '1'
                ? 'rtp'
                : parts[1] === '2'
                  ? 'rtcp'
                  : 'unknown'
            : 'unknown';

    let relatedAddress: string | null = null;
    let relatedPort: number | null = null;

    for (let i = 8; i < parts.length - 1; i++) {
        if (parts[i] === 'raddr') {
            relatedAddress = parts[i + 1];
        } else if (parts[i] === 'rport') {
            relatedPort = parseInt(parts[i + 1], 10);
        }
    }

    return {
        candidate,
        type: ['host', 'srflx', 'relay', 'prflx'].includes(type) ? type : 'unknown',
        protocol: ['udp', 'tcp'].includes(protocol) ? protocol : 'unknown',
        ip,
        port,
        relatedAddress,
        relatedPort,
        priority,
        foundation,
        component,
    };
}

export async function checkTurnServer(
    turnUrl: string,
    username: string,
    credential: string,
): Promise<TurnResult> {
    const startTime = performance.now();

    const result: TurnResult = {
        turnUrl,
        username,
        timestamp: Date.now(),
        success: false,
        responseTime: 0,
        publicIps: [],
        relayIps: [],
        candidates: [],
        error: null,
        localIps: [],
        allocationSuccess: false,
    };

    let pc: RTCPeerConnection | null = null;

    try {
        pc = new RTCPeerConnection({
            iceServers: [
                {
                    urls: turnUrl,
                    username,
                    credential,
                },
            ],
        });

        pc.createDataChannel('');

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const candidates = await new Promise<IceCandidateInfo[]>((resolve) => {
            const collected: IceCandidateInfo[] = [];
            const timeout = setTimeout(() => {
                resolve(collected);
            }, 15000);

            pc!.onicecandidate = (event) => {
                if (event.candidate) {
                    const parsed = parseCandidate(event.candidate.candidate);
                    collected.push(parsed);
                } else {
                    clearTimeout(timeout);
                    resolve(collected);
                }
            };

            pc!.onicecandidateerror = (event) => {
                const errorEvent = event as RTCPeerConnectionIceErrorEvent;
                if (errorEvent.errorCode === 701) {
                    return;
                }
                clearTimeout(timeout);
                result.error = `ICE error ${errorEvent.errorCode}: ${errorEvent.errorText || 'Unknown error'}`;
                resolve(collected);
            };

            pc!.onsignalingstatechange = () => {
                if (pc!.signalingState === 'closed') {
                    clearTimeout(timeout);
                    resolve(collected);
                }
            };
        });

        result.candidates = candidates;

        for (const c of candidates) {
            if (c.type === 'srflx' && c.ip && !result.publicIps.includes(c.ip)) {
                result.publicIps.push(c.ip);
            }
            if (c.type === 'relay' && c.ip && !result.relayIps.includes(c.ip)) {
                result.relayIps.push(c.ip);
            }
            if (c.type === 'host' && c.ip && !result.localIps.includes(c.ip)) {
                result.localIps.push(c.ip);
            }
        }

        result.allocationSuccess = candidates.some((c) => c.type === 'relay');
        result.success =
            candidates.length > 0 &&
            (result.allocationSuccess || candidates.some((c) => c.type === 'srflx'));

        if (!result.success && candidates.length === 0 && !result.error) {
            result.error =
                'No ICE candidates received. The TURN server may be unreachable or credentials may be invalid.';
        } else if (!result.allocationSuccess && !result.error) {
            result.error =
                'TURN relay allocation failed. The server may have rejected the credentials or relay allocation is not permitted.';
        }
    } catch (err) {
        result.error = err instanceof Error ? err.message : 'Unknown error';
    } finally {
        if (pc) {
            pc.close();
        }
    }

    result.responseTime = Math.round(performance.now() - startTime);
    return result;
}
