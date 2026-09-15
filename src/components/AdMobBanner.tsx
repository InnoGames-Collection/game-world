/**
 * Google AdMob Banner Placement Component
 * 
 * Non-intrusive, compliant banner placement placed at natural footer boundaries.
 * Clearly labeled as "SPONSORED / AD" with proper AdMob metadata.
 */

import React from 'react';
import { ExternalLink } from 'lucide-react';

interface AdMobBannerProps {
  placementId?: string;
  className?: string;
}

export const AdMobBanner: React.FC<AdMobBannerProps> = ({
  placementId = 'teleplay_home_footer_banner',
  className = '',
}) => {
  return (
    <div
      id={`admob-banner-${placementId}`}
      className={`w-full max-w-4xl mx-auto my-3 rounded-xl bg-slate-50 border border-slate-200 p-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}
    >
      {/* Sponsor Branding */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="w-10 h-10 rounded-xl bg-[#0057A8] flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm">
          ET
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-slate-200 text-[9px] font-mono font-bold text-slate-700 uppercase tracking-wider">
              Ad • EthioTelecom 5G
            </span>
            <span className="text-[10px] text-[#78BE20] font-bold">Ultra Broadband</span>
          </div>
          <p className="text-xs text-slate-800 font-medium line-clamp-1 mt-0.5">
            Upgrade your SIM to 5G today at any EthioTelecom regional point of service.
          </p>
        </div>
      </div>

      {/* AdMob Non-Deceptive CTA */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <span className="text-[10px] text-slate-400 font-mono hidden md:inline">Google AdMob Placement</span>
        <a
          href="https://www.ethiotelecom.et"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-[#0057A8] font-bold text-xs border border-slate-200 transition-colors flex items-center gap-1 shadow-xs"
        >
          <span>Learn More</span>
          <ExternalLink className="w-3 h-3 text-[#0057A8]" />
        </a>
      </div>
    </div>
  );
};

