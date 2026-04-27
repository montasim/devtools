export interface IceCandidateInfo {
    candidate: string;
    type: 'host' | 'srflx' | 'relay' | 'prflx' | 'unknown';
    protocol: 'udp' | 'tcp' | 'unknown';
    ip: string;
    port: number;
    relatedAddress: string | null;
    relatedPort: number | null;
    priority: number | null;
    foundation: string | null;
    component: 'rtp' | 'rtcp' | 'unknown';
}

export interface StunResult {
    stunUrl: string;
    timestamp: number;
    success: boolean;
    responseTime: number;
    publicIps: string[];
    candidates: IceCandidateInfo[];
    error: string | null;
    localIps: string[];
}

export const DEFAULT_STUN_SERVERS = [
    'stun:stun.l.google.com:19302',
    'stun:stun1.l.google.com:19302',
    'stun:stun2.l.google.com:19302',
    'stun:stun3.l.google.com:19302',
    'stun:stun4.l.google.com:19302',
    'stun:stun.stunprotocol.org:3478',
    'stun:stun.voip.eutelia.it:3478',
    'stun:stun.services.mozilla.com:3478',
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

export async function checkStunServer(stunUrl: string): Promise<StunResult> {
    const startTime = performance.now();

    const result: StunResult = {
        stunUrl,
        timestamp: Date.now(),
        success: false,
        responseTime: 0,
        publicIps: [],
        candidates: [],
        error: null,
        localIps: [],
    };

    let pc: RTCPeerConnection | null = null;

    try {
        pc = new RTCPeerConnection({
            iceServers: [{ urls: stunUrl }],
        });

        pc.createDataChannel('');

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const candidates = await new Promise<IceCandidateInfo[]>((resolve) => {
            const collected: IceCandidateInfo[] = [];
            const timeout = setTimeout(() => {
                resolve(collected);
            }, 10000);

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
            if (c.type === 'host' && c.ip && !result.localIps.includes(c.ip)) {
                result.localIps.push(c.ip);
            }
        }

        result.success = candidates.some((c) => c.type === 'srflx');
        if (!result.success && candidates.length === 0 && !result.error) {
            result.error = 'No ICE candidates received. The STUN server may be unreachable.';
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
