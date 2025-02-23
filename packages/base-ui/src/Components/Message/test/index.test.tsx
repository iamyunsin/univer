import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { Button } from '../../Button';
import { message } from '../Message';

describe('Message', () => {
    test('renders correctly', () => {
        const { container } = render(
            <Button
                onClick={() => {
                    message.success({
                        content: 'success content',
                    });
                }}
            >
                btn2
            </Button>
        );

        fireEvent.click(container.querySelector('button')!);

        expect(screen.getByText('success content')).toBeTruthy();
    });
});
