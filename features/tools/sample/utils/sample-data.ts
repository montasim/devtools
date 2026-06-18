export interface SampleDataEntry {
    id: string;
    title: string;
    description: string;
    content: string;
    category: 'json' | 'xml' | 'text' | 'base64';
}

export const SAMPLE_DATA_LIST: SampleDataEntry[] = [
    // --- JSON ---
    {
        id: 'json-user',
        title: 'Simple User Profile',
        description: 'A standard user profile payload with contact, status, and role fields.',
        category: 'json',
        content: `{
  "id": "usr_902183",
  "name": "Jane Doe",
  "email": "jane.doe@example.com",
  "role": "administrator",
  "isActive": true,
  "profile": {
    "avatar": "https://example.com/avatars/jane.png",
    "bio": "Software Engineer & open-source enthusiast.",
    "theme": "dark"
  },
  "createdAt": "2026-06-18T10:00:00Z"
}`,
    },
    {
        id: 'json-products',
        title: 'Products Catalog List',
        description: 'An array of product items containing pricing, ratings, and tag lists.',
        category: 'json',
        content: `[
  {
    "id": 101,
    "title": "Wireless Earbuds",
    "price": 79.99,
    "rating": 4.5,
    "tags": ["electronics", "audio", "wireless"],
    "inStock": true
  },
  {
    "id": 102,
    "title": "Ergonomic Office Chair",
    "price": 249.50,
    "rating": 4.8,
    "tags": ["furniture", "office", "ergonomic"],
    "inStock": false
  },
  {
    "id": 103,
    "title": "Smart Fitness Tracker",
    "price": 49.00,
    "rating": 4.2,
    "tags": ["electronics", "wearable", "fitness"],
    "inStock": true
  }
]`,
    },
    {
        id: 'json-geojson',
        title: 'GeoJSON Location Feature',
        description: 'A standard GeoJSON Point feature with spatial coordinates and attributes.',
        category: 'json',
        content: `{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [-122.4194, 37.7749]
  },
  "properties": {
    "name": "San Francisco, CA",
    "population": 873965,
    "established": 1776
  }
}`,
    },
    {
        id: 'json-config',
        title: 'App Settings Configuration',
        description: 'Application configuration payload with boolean features and nested properties.',
        category: 'json',
        content: `{
  "server": {
    "port": 8080,
    "host": "localhost",
    "enableSsl": false
  },
  "features": {
    "betaTesting": true,
    "multiTenant": false,
    "websockets": true
  },
  "cache": {
    "ttl": 3600,
    "provider": "redis",
    "endpoints": ["127.0.0.1:6379"]
  }
}`,
    },

    // --- XML ---
    {
        id: 'xml-bookstore',
        title: 'Bookstore Catalog',
        description: 'A catalog of books organized in categories with attributes and sub-elements.',
        category: 'xml',
        content: `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="cooking">
    <title lang="en">Everyday Italian</title>
    <author>Giada De Laurentiis</author>
    <year>2005</year>
    <price>30.00</price>
  </book>
  <book category="children">
    <title lang="en">Harry Potter</title>
    <author>J K. Rowling</author>
    <year>2005</year>
    <price>29.99</price>
  </book>
  <book category="web">
    <title lang="en">Learning XML</title>
    <author>Erik T. Ray</author>
    <year>2003</year>
    <price>39.95</price>
  </book>
</bookstore>`,
    },
    {
        id: 'xml-soap',
        title: 'SOAP Request Envelope',
        description: 'A standard SOAP envelope request template with parameter arguments.',
        category: 'xml',
        content: `<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope/"
               soap:encodingStyle="http://www.w3.org/2003/05/soap-encoding">
  <soap:Body xmlns:m="http://www.example.org/stock">
    <m:GetStockPrice>
      <m:StockName>GOOG</m:StockName>
    </m:GetStockPrice>
  </soap:Body>
</soap:Envelope>`,
    },
    {
        id: 'xml-rss',
        title: 'RSS Feed Item Channel',
        description: 'Standard RSS channel layout containing feed metadata and channel items.',
        category: 'xml',
        content: `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>DevTools Blog</title>
    <link>https://example.com/blog</link>
    <description>Latest news about web developer utilities.</description>
    <item>
      <title>Short Sharing Links are Live!</title>
      <link>https://example.com/blog/short-links</link>
      <description>We shortened URLs down to 5 alphanumeric characters.</description>
      <pubDate>Thu, 18 Jun 2026 09:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`,
    },
    {
        id: 'xml-svg',
        title: 'SVG Circle Element',
        description: 'A 100x100 XML-compliant SVG vector element drawing a blue circle.',
        category: 'xml',
        content: `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" stroke="navy" stroke-width="4" fill="royalblue" />
</svg>`,
    },

    // --- TEXT ---
    {
        id: 'text-lorem',
        title: 'Lorem Ipsum Paragraph',
        description: 'Classic placeholder filler text for layout prototyping.',
        category: 'text',
        content: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`,
    },
    {
        id: 'text-csv',
        title: 'CSV Users List',
        description: 'Comma Separated Values sheet listing users with standard table columns.',
        category: 'text',
        content: `id,first_name,last_name,email,role,is_active
101,John,Smith,john.smith@example.com,user,true
102,Alice,Johnson,alice.j@example.com,editor,true
103,Bob,Miller,bob.miller@example.com,admin,false
104,Clara,Davis,clara.d@example.com,user,true`,
    },
    {
        id: 'text-markdown',
        title: 'Markdown Readme Template',
        description: 'Structured Markdown document template with lists, formatting, and tables.',
        category: 'text',
        content: `# Project Title

A brief description of what this project does and who it's for.

## Features

- **Local first:** Runs entirely in browser local storage.
- **Fast:** Instant response times.
- **Beautiful:** Harmonious modern dark mode interface.

## Installation

\`\`\`bash
npm install devtools
\`\`\`

| Property | Type | Description |
| :--- | :--- | :--- |
| \`id\` | String | Unique identifier key |
| \`isActive\` | Boolean | State flag |`,
    },
    {
        id: 'text-log',
        title: 'Apache Access Logs Dump',
        description: 'Mock Apache server common log format trace entries.',
        category: 'text',
        content: `127.0.0.1 - - [18/Jun/2026:16:35:22 +0600] "GET / HTTP/1.1" 200 3426
127.0.0.1 - - [18/Jun/2026:16:35:25 +0600] "POST /api/shares HTTP/1.1" 200 482
192.168.0.15 - - [18/Jun/2026:16:36:01 +0600] "GET /share/qEkWO HTTP/1.1" 200 1024
127.0.0.1 - - [18/Jun/2026:16:36:10 +0600] "GET /static/logo.svg HTTP/1.1" 304 0`,
    },

    // --- BASE64 ---
    {
        id: 'base64-pixel-png',
        title: '1x1 Transparent PNG Pixel',
        description: 'A tiny Base64 data string representing a 1x1 transparent PNG pixel.',
        category: 'base64',
        content: `iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=`,
    },
    {
        id: 'base64-dot-png',
        title: 'Small Red PNG Dot',
        description: 'Base64 encoded string of a solid red dot PNG image.',
        category: 'base64',
        content: `iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAALEwAACxMBAJqcGAAAAC5JREFUKFNjYGBgqGfADxjQBcAYhFAoQICmCAVwKFSAqggmQC1FMEGwQpggGAkA+rQD9K3l4kQAAAAASUVORK5CYII=`,
    },
    {
        id: 'base64-text-doc',
        title: 'Simple Text Document',
        description: 'Base64 string representing a text file containing: "Hello, World! This is a simple test document."',
        category: 'base64',
        content: `SGVsbG8sIFdvcmxkISBUaGlzIGlzIGEgc2ltcGxlIHRlc3QgZG9jdW1lbnQu`,
    },
    {
        id: 'base64-svg-logo',
        title: 'Vector SVG Logo',
        description: 'Base64 string representing a simple XML SVG circle vector shape.',
        category: 'base64',
        content: `PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIHN0cm9rZT0ibmF2eSIgc3Ryb2std2lkdGg9IjQiIGZpbGw9InJveWFsYmx1ZSIgLz4KPC9zdmc+`,
    },
];
