import { render, screen } from '@testing-library/react';
import HomePage from '../page';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => '/',
}));

describe('HomePage', () => {
  it('renders without crashing', () => {
    render(<HomePage />);
    expect(document.body).toBeInTheDocument();
  });
});
