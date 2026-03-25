'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, User, Mail, Phone, Globe, MapPin, Users } from 'lucide-react';

interface Lead {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  location: string;
  companySize: string;
  title: string;
}

export function LeadCard({ lead }: { lead: Lead }) {
  return (
    <Card className="transition-all duration-200 hover:shadow-md hover:border-primary/30">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-3 flex-1">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-base">{lead.companyName}</h3>
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">{lead.industry}</Badge>
                <Badge variant="outline" className="text-xs gap-1">
                  <Users className="h-3 w-3" />
                  {lead.companySize}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-3.5 w-3.5 shrink-0" />
                <span>{lead.contactName} &middot; {lead.title}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>{lead.location}</span>
              </div>
              <a
                href={`mailto:${lead.email}`}
                className="flex items-center gap-2 text-primary hover:underline"
              >
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span>{lead.email}</span>
              </a>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5 shrink-0" />
                <span>{lead.phone}</span>
              </div>
            </div>
          </div>

          <a
            href={lead.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-primary hover:underline shrink-0"
          >
            <Globe className="h-3.5 w-3.5" />
            Website
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
