# DBMS Illustrated

An interactive, animated course on Database Management Systems. Zero frameworks — pure HTML, CSS, and JavaScript, with Three.js (CDN) for the hero animation only.

Live: [sridhar-3009.github.io/DBMS-Course](https://sridhar-3009.github.io/DBMS-Course)

---

## Topics

| # | Topic | Demo | Color |
|---|-------|------|-------|
| 01 | [Introduction to DBMS](topics/01-intro.html) | ER Diagram Builder | `#0EA5E9` |
| 02 | [Relational Model](topics/02-relational-model.html) | JOIN Visualizer | `#8B5CF6` |
| 03 | [SQL](topics/03-sql.html) | SQL Query Visualizer | `#10B981` |
| 04 | [Normalization](topics/04-normalization.html) | 1NF → 2NF → 3NF Animator | `#F59E0B` |
| 05 | [Transactions & ACID](topics/05-transactions.html) | Isolation Level Simulator | `#EF4444` |
| 06 | [Indexing](topics/06-indexing.html) | B+ Tree Traversal | `#06B6D4` |
| 07 | [Query Processing](topics/07-query-processing.html) | Query Plan Tree | `#3B82F6` |
| 08 | [Concurrency Control](topics/08-concurrency.html) | 2PL Deadlock Detector | `#EC4899` |
| 09 | [Storage Engines](topics/09-storage-engines.html) | Page/Block Storage | `#F97316` |
| 10 | [NoSQL Databases](topics/10-nosql.html) | NoSQL Comparison | `#84CC16` |
| 11 | [Distributed Databases](topics/11-distributed-databases.html) | Raft Consensus Simulation | `#A855F7` |
| 12 | [Interview Guide](topics/12-interview-guide.html) | Schema Designer | `#14B8A6` |

---

## Run Locally

```bash
git clone git@github.com:sridhar-3009/DBMS-Course.git
cd DBMS-Course
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080).

No build step, no npm install, no dependencies.

---

## File Structure

```
DBMS-Course/
├── index.html              # Home page with Three.js hero + 12-card grid
├── css/
│   └── style.css           # Full design system (CSS custom props, dark/light)
├── js/
│   ├── main.js             # Theme toggle, scroll progress, quiz, Q&A, Three.js hero
│   └── demos.js            # All 12 Canvas 2D interactive demos
└── topics/
    ├── 01-intro.html
    ├── 02-relational-model.html
    ├── 03-sql.html
    ├── 04-normalization.html
    ├── 05-transactions.html
    ├── 06-indexing.html
    ├── 07-query-processing.html
    ├── 08-concurrency.html
    ├── 09-storage-engines.html
    ├── 10-nosql.html
    ├── 11-distributed-databases.html
    └── 12-interview-guide.html
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, project conventions, demo guidance, and pull request expectations.

1. Fork and clone.
2. Pick a topic page or open a GitHub Issue.
3. Keep the style: vanilla JS only, Canvas 2D for demos, no npm.
4. Test with `python3 -m http.server` — no bundler needed.
5. Open a PR with a screenshot of the demo.

### Code Style

- **No frameworks.** Not React, Vue, Angular, Svelte — nothing.
- **No npm.** Not even a `package.json`. The only CDN load is Three.js r160 on `index.html`.
- **Canvas 2D** for all demos via the `mkCanvas()` helper in `demos.js`.
- **Theme-aware** — all canvas renders call `TC()` for colors; call the render fn on `body[data-theme]` changes.
- **CSS custom props** — `--topic-color` per page, global design tokens in `:root`.

---

## Stats

- 12 topics
- 12 interactive Canvas demos
- 36+ MCQ quiz questions
- 60+ Q&A accordion entries
- 0 npm dependencies
