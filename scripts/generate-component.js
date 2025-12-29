/**
 * Component Generator Script
 * 
 * Usage: node scripts/generate-component.js ComponentName [--ui] [--page] [--hook]
 * 
 * Options:
 *   --ui     Generate a UI component in src/components/ui
 *   --page   Generate a page component in src/pages
 *   --hook   Generate a custom hook in src/hooks
 * 
 * Examples:
 *   node scripts/generate-component.js Button --ui
 *   node scripts/generate-component.js Dashboard --page
 *   node scripts/generate-component.js useAuth --hook
 */

const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const componentName = args[0];

if (!componentName) {
  console.error('Please provide a component name');
  process.exit(1);
}

// Parse options
const isUI = args.includes('--ui');
const isPage = args.includes('--page');
const isHook = args.includes('--hook');

// Default to regular component if no option is specified
const type = isUI ? 'ui' : isPage ? 'page' : isHook ? 'hook' : 'component';

// Determine the output directory and file name
let outputDir;
let fileName;

if (isUI) {
  outputDir = path.join(__dirname, '..', 'src', 'components', 'ui');
  fileName = componentName.toLowerCase();
} else if (isPage) {
  outputDir = path.join(__dirname, '..', 'src', 'pages');
  fileName = componentName;
} else if (isHook) {
  outputDir = path.join(__dirname, '..', 'src', 'hooks');
  fileName = componentName;
} else {
  outputDir = path.join(__dirname, '..', 'src', 'components');
  fileName = componentName;
}

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate the component content based on the type
let content;

if (isHook) {
  content = `import { useState, useEffect, useCallback } from 'react';

/**
 * ${componentName} - Custom hook for [description]
 * 
 * @returns {Object} Hook return values
 */
export const ${componentName} = () => {
  // State
  const [state, setState] = useState();
  
  // Effects
  useEffect(() => {
    // Effect logic
    
    return () => {
      // Cleanup logic
    };
  }, []);
  
  // Callbacks
  const handleAction = useCallback(() => {
    // Action logic
  }, []);
  
  return {
    state,
    handleAction
  };
};

export default ${componentName};
`;
} else if (isUI) {
  // Convert to PascalCase for component name
  const pascalCaseName = componentName.charAt(0).toUpperCase() + componentName.slice(1);
  
  content = `import * as React from "react";
import { cn } from "@/lib/utils";

export interface ${pascalCaseName}Props extends React.HTMLAttributes<HTMLDivElement> {
  // Add custom props here
}

/**
 * ${pascalCaseName} UI component
 */
export const ${pascalCaseName} = React.forwardRef<HTMLDivElement, ${pascalCaseName}Props>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Add default classes here
          className
        )}
        {...props}
      />
    );
  }
);

${pascalCaseName}.displayName = "${pascalCaseName}";

export default ${pascalCaseName};
`;
} else if (isPage) {
  content = `import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * ${componentName} page component
 */
const ${componentName}: React.FC = () => {
  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">${componentName}</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Welcome to ${componentName}</CardTitle>
          <CardDescription>This is a new page component</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Add your content here</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ${componentName};
`;
} else {
  content = `import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * ${componentName} component
 */
const ${componentName}: React.FC = () => {
  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>${componentName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is the ${componentName} component</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ${componentName};
`;
}

// Write the file
const outputPath = path.join(outputDir, `${fileName}.tsx`);
fs.writeFileSync(outputPath, content);

console.log(`✅ Generated ${type} at ${outputPath}`);