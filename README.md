<img src="public/logo.png" alt="DataVision logo" width="50" height="50" />

# DataVision

DataVision takes a CSV file and runs an LLM-driven analysis on it: it cleans the data, proposes relationships worth testing, runs hypothesis tests with SciPy, and returns charts, p-values, and a plain-language summary. It was aimed at small-business owners who have data but no analyst.

Built at Bitcamp 2025 by a team of four: [TN0123](https://github.com/TN0123), [aadia1234](https://github.com/aadia1234), [bobbybotbop](https://github.com/bobbybotbop), and [aprameyak](https://github.com/aprameyak). Most of the code was written by TN0123 and aadia1234.

Video demo: https://youtu.be/DR2BjuHC1mY

![DataVision demo](https://github.com/user-attachments/assets/c4546767-9ad2-44b5-9be6-b538bb63ceb1)

## Features

- Upload a CSV from the home page; the backend stores it under `api/uploads/` with a random ID and deletes it when you leave the page.
- Data cleaning: Gemini inspects an overview of the dataframe and either reports that no cleaning is needed or writes a `clean_dataframe` function, which is run and the cleaned CSV saved.
- Test design: a LangGraph agent with two tools (`get_value_counts`, `filter_by_condition`) explores the columns and describes which relationships and hypothesis tests to run.
- Hypothesis testing: Gemini writes a `hypothesis_test` function using pandas, SciPy, Matplotlib, and Seaborn. The server runs it and returns one PNG figure (base64) and one p-value string per test.
- Summary and chat: a final summary of the results, plus a chat panel where follow-up questions can produce and run an `analyze(df)` function on the uploaded data.

## Tech stack

- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS 4, Radix UI / shadcn components
- Backend: Flask, LangChain and LangGraph, Google Gemini (`gemini-2.0-flash`)
- Analysis: pandas, NumPy, SciPy, Matplotlib, Seaborn

## Getting started

Prerequisites: Node.js, Python 3, and a Gemini API key.

The backend reads one environment variable, `GEMINI_API_KEY`, through `python-dotenv`. There is no `.env.example`; create a `.env` file in `api/` (or the repo root) containing that variable.

Start the Flask API on port 5000:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd api
python app.py
```

In a second terminal, start the Next.js app:

```bash
npm install
npm run dev
```

Open http://localhost:3000. `next.config.ts` rewrites `/api/*` to `http://localhost:5000/api/*`, so the API must be running locally.

There is no test suite. `api/generated_tests.py` is a saved example of model-generated test code, not a set of tests. `npm run lint` runs the Next.js linter.

## How it works

The frontend (`src/app/page.tsx` for upload, `src/app/analysis/page.tsx` for results, `src/components/chat.tsx` for chat) calls the Flask routes in `api/app.py` in order:

1. `POST /api/upload` saves the CSV and returns an ID.
2. `POST /api/data_cleaning` calls `api/clean.py`.
3. `POST /api/design_procedure` calls the LangGraph agent in `api/design.py`.
4. `POST /api/hypothesis_test` calls `api/hypothesis.py`.
5. `POST /api/summarize` calls `api/summarize.py`.
6. `POST /api/chat` calls `api/chat.py` for follow-up questions.

`POST /api/delete_file` is sent by `src/hooks/useDeleteFileOnExit.ts` when the tab closes or the user navigates away.

Note: the cleaning, hypothesis-testing, and chat steps run model-generated Python with `exec` on the server, with no sandboxing. This is a hackathon prototype; only run it locally with data and prompts you trust.

## Project structure

```
api/          Flask backend and analysis steps (app.py is the entry point)
interface/    Shared TypeScript types
public/       Logo and static assets
src/app/      Next.js pages (upload and analysis)
src/components/  Chat, header, footer, and UI components
src/hooks/    File cleanup hook
```

## Contributing

Issues and pull requests are welcome. Before opening a PR, run `npm run lint` and check that a CSV goes through the full pipeline locally.

## License

MIT. See [LICENSE](LICENSE).
