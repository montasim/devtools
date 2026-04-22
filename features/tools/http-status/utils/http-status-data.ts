export type StatusCodeCategory = '1xx' | '2xx' | '3xx' | '4xx' | '5xx';

export interface HttpStatusEntry {
    code: number;
    phrase: string;
    category: StatusCodeCategory;
    description: string;
    spec?: string;
}

export const CATEGORY_META: Record<StatusCodeCategory, { label: string; color: string }> = {
    '1xx': {
        label: 'Informational',
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    },
    '2xx': {
        label: 'Success',
        color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    },
    '3xx': {
        label: 'Redirection',
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    },
    '4xx': {
        label: 'Client Error',
        color: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    },
    '5xx': {
        label: 'Server Error',
        color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    },
};

export const HTTP_STATUS_CODES: HttpStatusEntry[] = [
    {
        code: 100,
        phrase: 'Continue',
        category: '1xx',
        description:
            'The server has received the request headers and the client should proceed to send the request body.',
        spec: 'RFC 9110',
    },
    {
        code: 101,
        phrase: 'Switching Protocols',
        category: '1xx',
        description:
            'The server is switching protocols as requested by the client via the Upgrade header.',
        spec: 'RFC 9110',
    },
    {
        code: 102,
        phrase: 'Processing',
        category: '1xx',
        description:
            'The server has received and is processing the request, but no response is available yet.',
        spec: 'RFC 2518',
    },
    {
        code: 103,
        phrase: 'Early Hints',
        category: '1xx',
        description: 'Used to return some response headers before the final HTTP message.',
        spec: 'RFC 8297',
    },

    {
        code: 200,
        phrase: 'OK',
        category: '2xx',
        description: 'The request has succeeded.',
        spec: 'RFC 9110',
    },
    {
        code: 201,
        phrase: 'Created',
        category: '2xx',
        description: 'The request has been fulfilled and a new resource has been created.',
        spec: 'RFC 9110',
    },
    {
        code: 202,
        phrase: 'Accepted',
        category: '2xx',
        description:
            'The request has been accepted for processing, but the processing has not been completed.',
        spec: 'RFC 9110',
    },
    {
        code: 203,
        phrase: 'Non-Authoritative Information',
        category: '2xx',
        description:
            'The returned meta-information is from a local or third-party copy, not the origin server.',
        spec: 'RFC 9110',
    },
    {
        code: 204,
        phrase: 'No Content',
        category: '2xx',
        description:
            'The server has fulfilled the request but does not need to return an entity-body.',
        spec: 'RFC 9110',
    },
    {
        code: 205,
        phrase: 'Reset Content',
        category: '2xx',
        description:
            'The server has fulfilled the request and the user agent should reset the document view.',
        spec: 'RFC 9110',
    },
    {
        code: 206,
        phrase: 'Partial Content',
        category: '2xx',
        description: 'The server has fulfilled the partial GET request for the resource.',
        spec: 'RFC 9110',
    },
    {
        code: 207,
        phrase: 'Multi-Status',
        category: '2xx',
        description:
            'Conveys information about multiple resources in situations where multiple status codes might be appropriate.',
        spec: 'RFC 4918',
    },
    {
        code: 208,
        phrase: 'Already Reported',
        category: '2xx',
        description:
            'Used in DAV binding to avoid enumerating the internal members of multiple bindings to the same collection repeatedly.',
        spec: 'RFC 5842',
    },
    {
        code: 226,
        phrase: 'IM Used',
        category: '2xx',
        description:
            'The server has fulfilled a GET request for the resource, and the response represents the result of instance-manipulations.',
        spec: 'RFC 3229',
    },

    {
        code: 300,
        phrase: 'Multiple Choices',
        category: '3xx',
        description: 'The target resource has more than one representation, each with its own URI.',
        spec: 'RFC 9110',
    },
    {
        code: 301,
        phrase: 'Moved Permanently',
        category: '3xx',
        description: 'The target resource has been assigned a new permanent URI.',
        spec: 'RFC 9110',
    },
    {
        code: 302,
        phrase: 'Found',
        category: '3xx',
        description: 'The target resource resides temporarily under a different URI.',
        spec: 'RFC 9110',
    },
    {
        code: 303,
        phrase: 'See Other',
        category: '3xx',
        description: 'The server is redirecting the user agent to a different resource via GET.',
        spec: 'RFC 9110',
    },
    {
        code: 304,
        phrase: 'Not Modified',
        category: '3xx',
        description: 'The resource has not been modified since the last request.',
        spec: 'RFC 9110',
    },
    {
        code: 305,
        phrase: 'Use Proxy',
        category: '3xx',
        description:
            'The requested resource must be accessed through the proxy given by the Location field.',
        spec: 'RFC 9110',
    },
    {
        code: 307,
        phrase: 'Temporary Redirect',
        category: '3xx',
        description:
            'The target resource resides temporarily under a different URI and the user agent must not change the request method.',
        spec: 'RFC 9110',
    },
    {
        code: 308,
        phrase: 'Permanent Redirect',
        category: '3xx',
        description:
            'The target resource has been assigned a new permanent URI and the user agent must not change the request method.',
        spec: 'RFC 9110',
    },

    {
        code: 400,
        phrase: 'Bad Request',
        category: '4xx',
        description:
            'The server cannot process the request due to something perceived to be a client error.',
        spec: 'RFC 9110',
    },
    {
        code: 401,
        phrase: 'Unauthorized',
        category: '4xx',
        description: 'The request requires user authentication.',
        spec: 'RFC 9110',
    },
    {
        code: 402,
        phrase: 'Payment Required',
        category: '4xx',
        description: 'Reserved for future use.',
        spec: 'RFC 9110',
    },
    {
        code: 403,
        phrase: 'Forbidden',
        category: '4xx',
        description: 'The server understood the request but refuses to authorize it.',
        spec: 'RFC 9110',
    },
    {
        code: 404,
        phrase: 'Not Found',
        category: '4xx',
        description:
            'The origin server did not find a current representation for the target resource.',
        spec: 'RFC 9110',
    },
    {
        code: 405,
        phrase: 'Method Not Allowed',
        category: '4xx',
        description:
            'The method received in the request-line is not supported by the target resource.',
        spec: 'RFC 9110',
    },
    {
        code: 406,
        phrase: 'Not Acceptable',
        category: '4xx',
        description:
            'The target resource does not have a representation acceptable per the Accept headers.',
        spec: 'RFC 9110',
    },
    {
        code: 407,
        phrase: 'Proxy Authentication Required',
        category: '4xx',
        description: 'The client must first authenticate itself with the proxy.',
        spec: 'RFC 9110',
    },
    {
        code: 408,
        phrase: 'Request Timeout',
        category: '4xx',
        description:
            'The server did not receive a complete request message within the time it was prepared to wait.',
        spec: 'RFC 9110',
    },
    {
        code: 409,
        phrase: 'Conflict',
        category: '4xx',
        description:
            'The request could not be completed due to a conflict with the current state of the target resource.',
        spec: 'RFC 9110',
    },
    {
        code: 410,
        phrase: 'Gone',
        category: '4xx',
        description:
            'The target resource is no longer available and no forwarding address is known.',
        spec: 'RFC 9110',
    },
    {
        code: 411,
        phrase: 'Length Required',
        category: '4xx',
        description: 'The server refuses to accept the request without a defined Content-Length.',
        spec: 'RFC 9110',
    },
    {
        code: 412,
        phrase: 'Precondition Failed',
        category: '4xx',
        description:
            'One or more conditions given in the request header fields evaluated to false.',
        spec: 'RFC 9110',
    },
    {
        code: 413,
        phrase: 'Content Too Large',
        category: '4xx',
        description: 'The request payload is larger than the server is willing or able to process.',
        spec: 'RFC 9110',
    },
    {
        code: 414,
        phrase: 'URI Too Long',
        category: '4xx',
        description: 'The request-target is longer than the server is willing to interpret.',
        spec: 'RFC 9110',
    },
    {
        code: 415,
        phrase: 'Unsupported Media Type',
        category: '4xx',
        description:
            'The origin server refuses the request because the payload is in an unsupported format.',
        spec: 'RFC 9110',
    },
    {
        code: 416,
        phrase: 'Range Not Satisfiable',
        category: '4xx',
        description:
            'None of the ranges in the Range header field overlap the current extent of the selected resource.',
        spec: 'RFC 9110',
    },
    {
        code: 417,
        phrase: 'Expectation Failed',
        category: '4xx',
        description:
            'The expectation given in the Expect header field could not be met by the server.',
        spec: 'RFC 9110',
    },
    {
        code: 418,
        phrase: "I'm a Teapot",
        category: '4xx',
        description: 'The server refuses to brew coffee because it is, permanently, a teapot.',
        spec: 'RFC 2324',
    },
    {
        code: 421,
        phrase: 'Misdirected Request',
        category: '4xx',
        description: 'The request was directed at a server that is not able to produce a response.',
        spec: 'RFC 9110',
    },
    {
        code: 422,
        phrase: 'Unprocessable Content',
        category: '4xx',
        description:
            'The server understands the content type and syntax but was unable to process the instructions.',
        spec: 'RFC 9110',
    },
    {
        code: 423,
        phrase: 'Locked',
        category: '4xx',
        description: 'The source or destination resource of a method is locked.',
        spec: 'RFC 4918',
    },
    {
        code: 424,
        phrase: 'Failed Dependency',
        category: '4xx',
        description:
            'The method could not be performed because the requested action depended on another action that failed.',
        spec: 'RFC 4918',
    },
    {
        code: 425,
        phrase: 'Too Early',
        category: '4xx',
        description: 'The server is unwilling to risk processing a request that might be replayed.',
        spec: 'RFC 8470',
    },
    {
        code: 426,
        phrase: 'Upgrade Required',
        category: '4xx',
        description: 'The server refuses to perform the request using the current protocol.',
        spec: 'RFC 9110',
    },
    {
        code: 428,
        phrase: 'Precondition Required',
        category: '4xx',
        description: 'The origin server requires the request to be conditional.',
        spec: 'RFC 6585',
    },
    {
        code: 429,
        phrase: 'Too Many Requests',
        category: '4xx',
        description:
            'The user has sent too many requests in a given amount of time (rate limiting).',
        spec: 'RFC 6585',
    },
    {
        code: 431,
        phrase: 'Request Header Fields Too Large',
        category: '4xx',
        description:
            'The server is unwilling to process the request because its header fields are too large.',
        spec: 'RFC 6585',
    },
    {
        code: 451,
        phrase: 'Unavailable For Legal Reasons',
        category: '4xx',
        description:
            'The server is denying access to the resource as a consequence of a legal demand.',
        spec: 'RFC 7725',
    },

    {
        code: 500,
        phrase: 'Internal Server Error',
        category: '5xx',
        description:
            'The server encountered an unexpected condition that prevented it from fulfilling the request.',
        spec: 'RFC 9110',
    },
    {
        code: 501,
        phrase: 'Not Implemented',
        category: '5xx',
        description:
            'The server does not support the functionality required to fulfill the request.',
        spec: 'RFC 9110',
    },
    {
        code: 502,
        phrase: 'Bad Gateway',
        category: '5xx',
        description:
            'The server, while acting as a gateway or proxy, received an invalid response from an inbound server.',
        spec: 'RFC 9110',
    },
    {
        code: 503,
        phrase: 'Service Unavailable',
        category: '5xx',
        description:
            'The server is currently unable to handle the request due to temporary overloading or maintenance.',
        spec: 'RFC 9110',
    },
    {
        code: 504,
        phrase: 'Gateway Timeout',
        category: '5xx',
        description:
            'The server, while acting as a gateway or proxy, did not receive a timely response from an upstream server.',
        spec: 'RFC 9110',
    },
    {
        code: 505,
        phrase: 'HTTP Version Not Supported',
        category: '5xx',
        description:
            'The server does not support the major version of HTTP that was used in the request.',
        spec: 'RFC 9110',
    },
    {
        code: 506,
        phrase: 'Variant Also Negotiates',
        category: '5xx',
        description:
            'Transparent content negotiation for the request results in a circular reference.',
        spec: 'RFC 2295',
    },
    {
        code: 507,
        phrase: 'Insufficient Storage',
        category: '5xx',
        description:
            'The method could not be performed on the resource because the server is unable to store the representation.',
        spec: 'RFC 4918',
    },
    {
        code: 508,
        phrase: 'Loop Detected',
        category: '5xx',
        description: 'The server detected an infinite loop while processing the request.',
        spec: 'RFC 5842',
    },
    {
        code: 510,
        phrase: 'Not Extended',
        category: '5xx',
        description: 'Further extensions to the request are required for the server to fulfill it.',
        spec: 'RFC 2774',
    },
    {
        code: 511,
        phrase: 'Network Authentication Required',
        category: '5xx',
        description: 'The client needs to authenticate to gain network access.',
        spec: 'RFC 6585',
    },
];

export function getCategory(code: number): StatusCodeCategory {
    if (code < 200) return '1xx';
    if (code < 300) return '2xx';
    if (code < 400) return '3xx';
    if (code < 500) return '4xx';
    return '5xx';
}

export function searchStatusCodes(query: string): HttpStatusEntry[] {
    if (!query.trim()) return HTTP_STATUS_CODES;
    const q = query.toLowerCase().trim();
    const numQ = parseInt(q, 10);
    return HTTP_STATUS_CODES.filter((entry) => {
        if (!isNaN(numQ) && String(entry.code).includes(q)) return true;
        if (entry.phrase.toLowerCase().includes(q)) return true;
        if (entry.description.toLowerCase().includes(q)) return true;
        if (entry.category.includes(q)) return true;
        return false;
    });
}
