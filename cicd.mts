import { Client, connect } from '@dagger.io/dagger';

// Initialize Dagger client
connect(
  async (client: Client) => {
    // Get local project reference
    const source = client.host().directory('.', {
      exclude: ['node_modules/**'],
      include: ['**/*'],
    });

    // Get Node image
    const node = client.container().from('node:20');

    // Mount cloned repository into node image
    const runner = node
      .withDirectory('/src', source)
      .withWorkdir('/src')
      .withExec(['npm', 'install']);

    // Check formatter
    runner.withExec(['npm', 'run', 'format-check']).sync();

    // Check build
    runner.withExec(['npm', 'run', 'build']).sync();

    // Lint
    runner.withExec(['npm', 'run', 'lint']).sync();
  },
  { LogOutput: process.stderr },
);
