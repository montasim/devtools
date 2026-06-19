'use client';

import { ApiReference } from '../../shared/api-reference';
import type { TabComponentProps } from '../../core/types/tool';

export default function ApiRefTab({ readOnly }: TabComponentProps) {
    const curlExample = `curl -X POST http://localhost:3000/api/spam-words/check \\
  -H "Content-Type: application/json" \\
  -d '{"text": "Get rich quick! Click here to claim your free cash prize now!"}'`;

    const jsExample = `fetch('/api/spam-words/check', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: 'Get rich quick! Click here to claim your free cash prize now!'
  })
})
.then(res => res.json())
.then(data => console.log(data));`;

    const responseExample = `{
  "spam": true
}`;

    return (
        <ApiReference
            title="Spam Words Checker API"
            description="Programmatically check content (like emails, articles, or SMS) to detect known spam words and marketing triggers."
            method="POST"
            endpoint="/api/spam-words/check"
            bodyParams={[
                {
                    name: 'text',
                    type: 'string',
                    required: true,
                    description: 'The body text or message content to check for spam triggers.',
                },
            ]}
            testInputs={[
                {
                    name: 'text',
                    label: 'Text to Analyze',
                    type: 'textarea',
                    placeholder: 'Enter message text to analyze for spam trigger words...',
                    defaultValue: 'Get rich quick! Click here to claim your free cash prize now!',
                },
            ]}
            curlExample={curlExample}
            jsExample={jsExample}
            responseExample={responseExample}
        />
    );
}
