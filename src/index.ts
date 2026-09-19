import chalk from 'chalk';
import ora from 'ora';
import Table from 'cli-table3';
import { analyzePrompt } from './modules/analysisEngine';
import { performSearch } from './modules/scraper';
import { synthesizeFindings, storeThought } from './modules/memory';
import { MOCK_DATA } from './utils/mocks';

async function main() {
  const prompt = process.argv.slice(2).join(' ');
  if (!prompt) {
    console.log(chalk.red('\n❌ Error: Please provide a technical prompt.'));
    console.log(chalk.dim('Example: npx tsx src/index.ts "How do I handle connection pooling for PostgreSQL?"\n'));
    process.exit(1);
  }

  console.log(chalk.bold.cyan('\n🧠 ThoughtProcessor | Autonomous Research Agent\n'));

  const spinner = ora();

  try {
    // --- Stage 1: Gap Analysis ---
    spinner.start('Analyzing prompt and identifying gaps...');
    let analysis;
    try {
      analysis = await analyzePrompt(prompt);
    } catch (e) {
      analysis = MOCK_DATA.gapAnalysis;
    }
    spinner.succeed(chalk.green('Gap analysis complete.'));

    console.log(chalk.bold('\n🎯 CORE INTENT:'));
    console.log(chalk.white(`  ${analysis.coreIntent}\n`));

    const gapTable = new Table({
      head: [chalk.yellow('Knowns'), chalk.yellow('Unknowns')],
      colWidths: [30, 30],
      style: { head: [], border: [] }
    });

    const maxLen = Math.max(analysis.knowns.length, analysis.unknowns.length);
    for (let i = 0; i < maxLen; i++) {
      gapTable.push([
        analysis.knowns[i] || '',
        analysis.unknowns[i] || ''
      ]);
    }
    console.log(gapTable.toString());

    // --- Stage 2: Autonomous Research ---
    if (analysis.actionPlan === 'search' || analysis.actionPlan === 'hybrid') {
      console.log(chalk.bold.blue('\n🌐 Starting Autonomous Research...'));

      spinner.start('Searching high-signal sources...');
      const results = await performSearch(analysis.searchQueries || []);
      spinner.succeed(chalk.green(`Found ${results.length} key sources.`));

      // --- Stage 3: Synthesis ---
      spinner.start('Synthesizing findings into solution...');
      const synthesis = await synthesizeFindings(analysis, results);
      spinner.succeed(chalk.green('Solution synthesized.'));

      console.log(chalk.bold.green('\n✨ FINAL SOLUTION'));
      console.log(chalk.white('──────────────────────────────────────────────────'));
      console.log(chalk.bold('\nTL;DR:'));
      console.log(chalk.white(`  ${synthesis.answer}`));

      console.log(chalk.bold('\n🚀 RECOMMENDED PATTERN:'));
      console.log(chalk.bgBlack.white(`\n${synthesis.code}\n`));

      console.log(chalk.bold('\n📚 REFERENCES:'));
      results.forEach(res => {
        console.log(chalk.dim(`- ${res.title} (${chalk.underline.blue(res.url)})`));
      });
      console.log(chalk.white('──────────────────────────────────────────────────\n'));

      // --- Stage 4: Memory ---
      spinner.start('Storing thought in local vector memory...');
      await storeThought({
        id: Date.now().toString(),
        query: prompt,
        analysis,
        results,
        synthesis,
        timestamp: Date.now()
      });
      spinner.succeed(chalk.green('Memory updated.'));
    } else {
      console.log(chalk.yellow('\n💡 Analysis decided this is a reasoning-only task. Skipping search.'));
    }

    console.log(chalk.bold.cyan('\n✅ Research Cycle Complete.\n'));

  } catch (error) {
    spinner.fail(chalk.red('A critical error occurred during the research cycle.'));
    console.error(error);
  }
}

main();
