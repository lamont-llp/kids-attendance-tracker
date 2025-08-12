# Contributing

Thanks for contributing to Kids Attendance Tracker!

## Testing projects

We use Jest with separate projects/environments:

- Web/UI tests (jsdom): jest.config.js
  - Run: pnpm jest --config jest.config.js
- API tests (node): jest.api.config.js
  - Run: pnpm jest --config jest.api.config.js
- All projects:
  - Run: pnpm test
- Watch mode per project:
  - Web: pnpm test:watch:web
  - API: pnpm test:watch:api

Important notes:

- Mock database access in API tests (jest.mock('@/utils'), jest.mock('@/utils/schema')).
- If importing next/server, mock its classes (NextRequest, NextResponse) or keep handlers thin and test pure logic in utils/lib.
