'use client';

import { ApiReference } from '../../shared/api-reference';
import type { TabComponentProps } from '../../core/types/tool';

export default function ApiRefTab({ readOnly }: TabComponentProps) {
    const curlExample = `curl -X POST http://localhost:3000/api/password/check-leaked \\
  -H "Content-Type: application/json" \\
  -d '{"password": "password123"}'`;

    const jsExample = `fetch('/api/password/check-leaked', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    password: 'password123'
  })
})
.then(res => res.json())
.then(data => console.log(data));`;

    const responseExample = `{
  "leaked": true
}`;

    return (
        <ApiReference
            title="Password Leak Checker API"
            description="Check if a password has been compromised or exists in common leaked password databases."
            method="POST"
            endpoint="/api/password/check-leaked"
            bodyParams={[
                {
                    name: 'password',
                    type: 'string',
                    required: true,
                    description: 'The plain-text password to check against common leak databases.',
                },
            ]}
            testInputs={[
                {
                    name: 'password',
                    label: 'Password to Check',
                    type: 'password',
                    placeholder: 'Enter password to check',
                    defaultValue: 'password123',
                },
            ]}
            curlExample={curlExample}
            jsExample={jsExample}
            responseExample={responseExample}
        />
    );
}
