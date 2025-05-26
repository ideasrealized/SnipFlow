const esbuild = require('esbuild');
const path = require('path');

const isDevelopment = process.env.NODE_ENV !== 'production';

// Build for index.tsx (main app renderer)
esbuild.build({
  entryPoints: [path.join(__dirname, 'src/renderer/index.tsx')],
  bundle: true,
  outfile: path.join(__dirname, 'dist/renderer/bundle.js'),
  platform: 'browser', // for browser environments
  format: 'iife', // immediately-invoked function expression
  sourcemap: isDevelopment,
  minify: !isDevelopment,
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  loader: {
    '.js': 'jsx',
    '.ts': 'tsx',
    '.tsx': 'tsx',
    '.css': 'css' // esbuild can bundle CSS imports directly
  },
  // To ensure React and ReactDOM are not bundled if they are meant to be external
  // However, for an Electron app, bundling them is usually fine and simpler.
  // external: isDevelopment ? [] : ['react', 'react-dom'], 
  define: {
    'process.env.NODE_ENV': isDevelopment ? '"development"' : '"production"'
  },
  logLevel: 'info'
}).catch(() => {
  console.error('esbuild failed for index.tsx');
  process.exit(1);
});

// Build for overlay.ts
esbuild.build({
  entryPoints: [path.join(__dirname, 'src/overlay.ts')],
  bundle: true,
  outfile: path.join(__dirname, 'dist/overlay.js'), // Correct path for <script src="overlay.js">
  platform: 'browser',
  format: 'iife', // IIFE is good for scripts loaded via <script>
  sourcemap: isDevelopment,
  minify: !isDevelopment,
  loader: {
    '.ts': 'ts' // overlay.ts doesn't use JSX
  },
  define: {
    'process.env.NODE_ENV': isDevelopment ? '"development"' : '"production"'
  },
  logLevel: 'info'
}).catch(() => {
  console.error('esbuild failed for overlay.ts');
  process.exit(1);
});

// Build for src/renderer.ts (legacy main window renderer)
esbuild.build({
  entryPoints: [path.join(__dirname, 'src/renderer.ts')],
  bundle: true,
  outfile: path.join(__dirname, 'dist/renderer/legacy-renderer.js'),
  platform: 'browser', // Keep as browser, but externalize Node modules
  format: 'iife',
  sourcemap: isDevelopment,
  minify: !isDevelopment,
  loader: {
    '.ts': 'ts'
  },
  external: ['fs', 'path', 'os', 'crypto'], // Add crypto here too, just in case, and others from logger
  define: {
    'process.env.NODE_ENV': isDevelopment ? '"development"' : '"production"'
  },
  logLevel: 'info'
}).catch(() => {
  console.error('esbuild failed for src/renderer.ts (legacy)');
  process.exit(1);
});

// Build for ChainManager window
esbuild.build({
  entryPoints: [path.join(__dirname, 'src/renderer/chainManagerIndex.tsx')],
  bundle: true,
  outfile: path.join(__dirname, 'dist/renderer/chainManagerBundle.js'),
  platform: 'browser',
  format: 'iife',
  sourcemap: isDevelopment,
  minify: !isDevelopment,
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  loader: {
    '.js': 'jsx',
    '.ts': 'tsx',
    '.tsx': 'tsx',
    '.css': 'css'
  },
  define: {
    'process.env.NODE_ENV': isDevelopment ? '"development"' : '"production"'
  },
  logLevel: 'info'
}).catch(() => {
  console.error('esbuild failed for src/renderer/chainManagerIndex.tsx');
  process.exit(1);
}); 