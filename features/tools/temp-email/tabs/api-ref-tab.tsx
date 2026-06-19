'use client';

import { ApiReference } from '../../shared/api-reference';
import type { TabComponentProps } from '../../core/types/tool';

export default function ApiRefTab({ readOnly }: TabComponentProps) {
    const curlExample = `curl -X POST http://localhost:3000/api/temp-email/check \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@mailinator.com"}'`;

    const jsExample = `fetch('/api/temp-email/check', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@mailinator.com'
  })
})
.then(res => res.json())
.then(data => console.log(data));`;

    const responseExample = `{
  "disposable": true
}`;

    return (
        <ApiReference
            title="Temporary Email Checker API"
            description="Programmatically check domains or email addresses against our real-time database of known temporary and disposable email providers."
            method="POST"
            endpoint="/api/temp-email/check"
            bodyParams={[
                {
                    name: 'email',
                    type: 'string',
                    required: false,
                    description: 'The full email address to check (e.g. user@tempmail.com). The domain name will be automatically extracted and validated.',
                },
                {
                    name: 'domain',
                    type: 'string',
                    required: false,
                    description: 'The domain name to check directly (e.g. tempmail.com). Required if "email" is not provided.',
                },
            ]}
            testInputs={[
                {
                    name: 'email',
                    label: 'Email Address',
                    type: 'text',
                    placeholder: 'e.g. user@mailinator.com',
                    defaultValue: 'user@mailinator.com',
                },
                {
                    name: 'domain',
                    label: 'Domain Name',
                    type: 'text',
                    placeholder: 'e.g. mailinator.com',
                    defaultValue: '',
                },
            ]}
            curlExample={curlExample}
            jsExample={jsExample}
            responseExample={responseExample}
        />
    );
}
