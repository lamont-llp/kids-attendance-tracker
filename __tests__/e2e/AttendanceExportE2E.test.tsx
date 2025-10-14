import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AttendancePage from '@/app/dashboard/attendance/page';

// Stub grid to avoid network/axios calls in E2E
jest.mock('@/app/dashboard/attendance/_components/AttendanceGrid', () => () => <div data-testid="grid-stub" />);

describe('Attendance Export E2E', () => {
    const originalFetch = global.fetch;
    const originalCreateObjectURL = window.URL.createObjectURL;
    const originalRevokeObjectURL = window.URL.revokeObjectURL;
    const originalCreateElement = document.createElement.bind(document);

    beforeEach(() => {
        jest.resetAllMocks();
    });

    afterEach(() => {
        global.fetch = originalFetch as any;
        window.URL.createObjectURL = originalCreateObjectURL;
        window.URL.revokeObjectURL = originalRevokeObjectURL;
        document.createElement = originalCreateElement as any;
    });

    it('downloads CSV when Export CSV is clicked', async () => {
        const headers = new Headers({ 'content-disposition': 'attachment; filename="attendance-test.csv"' });
        global.fetch = jest.fn(async () => ({
            ok: true,
            headers,
            blob: async () => new Blob(['name\n'], { type: 'text/csv' }),
        } as any));

        const clickMock = jest.fn();
        const setAttrMock = jest.fn();
        window.URL.createObjectURL = jest.fn(() => 'blob:test');
        window.URL.revokeObjectURL = jest.fn();
        document.createElement = jest.fn((tagName: string) => {
            const el = originalCreateElement(tagName) as any;
            if (tagName.toLowerCase() === 'a') {
                el.setAttribute = setAttrMock as any;
                el.click = clickMock as any;
            }
            return el;
        }) as any;

        render(<AttendancePage />);

        const exportBtn = await screen.findByRole('button', { name: /export csv/i });
        fireEvent.click(exportBtn);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
            expect(clickMock).toHaveBeenCalled();
            expect(setAttrMock).toHaveBeenCalledWith('download', 'attendance-test.csv');
        });
    });
});


