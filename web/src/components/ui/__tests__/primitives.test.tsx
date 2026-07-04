import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Badge } from '../Badge';
import { Button } from '../Button';
import { PriceTag } from '../PriceTag';
import { SectionHeading } from '../SectionHeading';

describe('PriceTag', () => {
  it('shows price, compare price and discount badge when discounted', () => {
    render(<PriceTag price={2500} compareAtPrice={12690} />);
    expect(screen.getByText('Rs. 2,500')).toBeInTheDocument();
    expect(screen.getByText('Rs. 12,690')).toBeInTheDocument();
    expect(screen.getByText('-80%')).toBeInTheDocument();
  });

  it('shows only price when not discounted', () => {
    render(<PriceTag price={3890} compareAtPrice={null} />);
    expect(screen.getByText('Rs. 3,890')).toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });
});

describe('Button', () => {
  it('renders children and respects disabled', () => {
    render(<Button disabled>Add to Cart</Button>);
    expect(screen.getByRole('button', { name: 'Add to Cart' })).toBeDisabled();
  });
});

describe('Badge', () => {
  it('renders content', () => {
    render(<Badge tone="gold">Ages 3-10</Badge>);
    expect(screen.getByText('Ages 3-10')).toBeInTheDocument();
  });
});

describe('SectionHeading', () => {
  it('renders title as h2', () => {
    render(<SectionHeading title="Best Selling Products" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Best Selling Products' })).toBeInTheDocument();
  });
});
