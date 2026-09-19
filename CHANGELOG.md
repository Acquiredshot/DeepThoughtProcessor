# Changelog

## [v2.4.0] - 2026-09-19
### Added
- **Full-Stack UI**: Implemented a professional React + Tailwind CSS dashboard with real-time progress tracking and a "Research Feed".
- **Local AI Integration**: Added Ollama support for local, private gap analysis and synthesis (Llama3/Phi3).
- **Search Integration**: Integrated Tavily AI for autonomous, high-signal web research.
- **Stop Button**: Implemented a request cancellation system to stop hanging AI processes.
- **Vector Memory**: Built a system to store synthesized "thoughts" for future retrieval.
- **Robust Config**: Added API key trimming and connection diagnostics to prevent "Unauthorized" errors.

### Changed
- **Execution Model**: Moved from a simple CLI script to a Client-Server architecture (Express + React).
- **Analysis Engine**: Upgraded from static mocks to a dynamic, LLM-powered gap analysis pipeline.
- **Synthesis Logic**: Implemented a research-based synthesis engine that summarizes actual web results instead of using placeholders.

### Fixed
- **UI Rendering**: Resolved issues with Tailwind CSS not loading in the browser.
- **Ollama Timeouts**: Added a 20s timeout and "Fast-Path" fallback to prevent the application from hanging.
- **Module Resolution**: Fixed `ts-node` and `tsx` module errors during project initialization.
