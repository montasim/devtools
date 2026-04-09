'use client';

import { useState } from 'react';
import { Toolbar } from '@/components/toolbar';

export default function Home() {
  const [ignoreKeyOrder, setIgnoreKeyOrder] = useState(true);
  const [prettyPrint, setPrettyPrint] = useState(true);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [semanticTypeDiff, setSemanticTypeDiff] = useState(false);

  return (
    <div>
      <Toolbar
        toggles={[
          { id: '1', label: 'Ignore Key Order', checked: ignoreKeyOrder, onChange: setIgnoreKeyOrder },
          { id: '2', label: 'Pretty Print', checked: prettyPrint, onChange: setPrettyPrint },
          { id: '3', label: 'Ignore Whitespace', checked: ignoreWhitespace, onChange: setIgnoreWhitespace },
          { id: '4', label: 'Semantic Type Diff', checked: semanticTypeDiff, onChange: setSemanticTypeDiff },
        ]}
        actions={[
          { id: 'clear', label: 'Clear All', onClick: () => {}, variant: 'outline' },
          { id: 'compare', label: 'Compare', onClick: () => {}, variant: 'default' },
        ]}
      />
    </div>
  );
}
