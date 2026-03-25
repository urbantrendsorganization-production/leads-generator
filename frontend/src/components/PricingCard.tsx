'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingCardProps {
  name: string;
  price: number;
  tokens: number;
  description: string;
  popular?: boolean;
  onSelect?: () => void;
  buttonText?: string;
  disabled?: boolean;
}

export function PricingCard({
  name,
  price,
  tokens,
  description,
  popular,
  onSelect,
  buttonText = 'Get Started',
  disabled,
}: PricingCardProps) {
  const pricePerSearch = (price / tokens).toFixed(2);

  return (
    <Card
      className={cn(
        'relative flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
        popular && 'border-primary shadow-lg shadow-primary/10 scale-[1.02]'
      )}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="px-4 py-1 text-sm">Most Popular</Badge>
        </div>
      )}
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-lg font-medium text-muted-foreground">{name}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold">${price}</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        <div className="space-y-2">
          <Feature text={`${tokens} lead searches`} />
          <Feature text={`$${pricePerSearch} per search`} />
          <Feature text="Detailed contact info" />
          <Feature text="Export to CSV" />
          {tokens >= 50 && <Feature text="Priority results" />}
          {tokens >= 150 && <Feature text="Advanced filters" />}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={popular ? 'default' : 'outline'}
          size="lg"
          onClick={onSelect}
          disabled={disabled}
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Check className="h-4 w-4 text-primary shrink-0" />
      <span>{text}</span>
    </div>
  );
}
