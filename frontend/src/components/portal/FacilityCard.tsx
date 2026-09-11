import React from 'react';
import { MapPin, Phone, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HealthFacility } from '../../types/govPortal';

interface FacilityCardProps {
  facility: HealthFacility;
  onOpenDetails: (facility: HealthFacility) => void;
}

export const FacilityCard: React.FC<FacilityCardProps> = ({ facility, onOpenDetails }) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-gov hover:border-govNavy transition-all duration-300 flex flex-col justify-between space-y-4 group">
      
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <span className="px-2.5 py-1 bg-govNavy-soft text-govNavy-dark font-extrabold text-[11px] rounded-md uppercase tracking-wider">
            {t(`healthcare.types.${facility.type}`, facility.type)}
          </span>
          {facility.hasCognitiveCare && (
            <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold text-[11px] rounded-md flex items-center gap-1">
              <Heart className="w-3 h-3 text-amber-600 fill-amber-600" /> {t('portal.cognitiveCareNode', 'Cognitive Care Node')}
            </span>
          )}
        </div>

        <h3 className="font-serif font-bold text-lg text-slate-900 group-hover:text-govNavy transition-colors">
          {facility.name}
        </h3>

        <div className="space-y-1.5 text-xs text-slate-600 font-medium">
          <p className="flex items-center gap-1.5 text-slate-800 font-bold">
            <MapPin className="w-3.5 h-3.5 text-govNavy shrink-0" />
            <span>{facility.district}, {t(`states.${facility.stateCode}`, facility.state)}</span>
          </p>
          <p className="text-slate-600 line-clamp-1">{facility.address}</p>
        </div>

        {/* Services Badges */}
        <div className="pt-1 flex flex-wrap items-center gap-1.5">
          {facility.services.slice(0, 3).map((srv) => (
            <span key={srv} className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px] font-semibold">
              {t(`healthcare.services.${srv}`, srv)}
            </span>
          ))}
          {facility.services.length > 3 && (
            <span className="text-[10px] font-bold text-slate-500">
              +{facility.services.length - 3}
            </span>
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
          <Phone className="w-3.5 h-3.5 text-govNavy" />
          <span>{facility.contactNumber}</span>
        </div>

        <button
          onClick={() => onOpenDetails(facility)}
          className="text-xs font-extrabold text-govNavy hover:underline cursor-pointer"
        >
          {t('portal.viewDetails', 'View Details')} →
        </button>
      </div>

    </div>
  );
};
