import React, { useState, useEffect } from 'react';
import { Search, Filter, Building2, MapPin, Phone, Heart, X, ShieldAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { HealthFacility, FacilityType, GovPortalFilters } from '../../types/govPortal';
import { portalService } from '../../services/portalService';
import { FacilityCard } from './FacilityCard';
import { Modal } from '../common/Modal';

interface FacilitySearchProps {
  initialStateFilter?: string;
  initialSearchQuery?: string;
}

export const FacilitySearch: React.FC<FacilitySearchProps> = ({
  initialStateFilter = 'All',
  initialSearchQuery = '',
}) => {
  const { t } = useTranslation();
  const [facilities, setFacilities] = useState<HealthFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFacility, setSelectedFacility] = useState<HealthFacility | null>(null);

  // Filters State
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedState, setSelectedState] = useState(initialStateFilter);
  const [selectedType, setSelectedType] = useState('All');
  const [hasCognitiveOnly, setHasCognitiveOnly] = useState(false);

  useEffect(() => {
    if (initialStateFilter !== 'All') {
      setSelectedState(initialStateFilter);
    }
  }, [initialStateFilter]);

  useEffect(() => {
    if (initialSearchQuery) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  useEffect(() => {
    const fetchFacilities = async () => {
      setLoading(true);
      const filters: GovPortalFilters = {
        searchQuery,
        selectedState,
        selectedDistrict: 'All',
        selectedType,
        hasCognitiveOnly,
      };
      const data = await portalService.searchFacilities(filters);
      setFacilities(data);
      setLoading(false);
    };

    fetchFacilities();
  }, [searchQuery, selectedState, selectedType, hasCognitiveOnly]);

  const statesList = [
    'All',
    'Assam',
    'Arunachal Pradesh',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Sikkim',
    'Tripura',
  ];

  const facilityTypes: Array<FacilityType | 'All'> = [
    'All',
    'Medical College Hospital',
    'District Hospital',
    'Community Health Centre (CHC)',
    'Primary Health Centre (PHC)',
    'Specialized Cognitive Care Centre',
  ];

  return (
    <section id="facilities-section" className="py-12 md:py-16 bg-white border-b border-slate-200">
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-govNavy-dark flex items-center gap-1">
              <Building2 className="w-4 h-4 text-govNavy" /> {t('portal.officialDirectory', { defaultValue: 'Official Health Directory' })}
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mt-1">
              {t('portal.findFacility', { defaultValue: 'Find a Healthcare Facility' })}
            </h2>
            <p className="text-slate-600 text-sm md:text-base mt-1">
              {t('portal.searchFacilitySubtitle', { defaultValue: 'Search hospitals, primary health centers, and cognitive care nodes across North East India.' })}
            </p>
          </div>

          {/* Development Sample Data Indicator Badge */}
          <span className="text-xs font-bold text-amber-900 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-300 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>{t('portal.sampleDataBadge', { defaultValue: 'Development Sample Data Layer' })}</span>
          </span>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t('portal.searchByNameOrDistrict', { defaultValue: 'Search by facility name or district...' })}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-govNavy font-medium"
              />
            </div>

            {/* State Filter */}
            <div className="md:col-span-3">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-govNavy font-semibold"
              >
                {statesList.map((st) => (
                  <option key={st} value={st}>
                    {t('portal.filterState', { defaultValue: 'State' })}: {st === 'All' ? t('common.all', { defaultValue: 'All' }) : st}
                  </option>
                ))}
              </select>
            </div>

            {/* Facility Type Filter */}
            <div className="md:col-span-4">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-govNavy font-semibold"
              >
                {facilityTypes.map((tItem) => (
                  <option key={tItem} value={tItem}>
                    {t('portal.filterType', { defaultValue: 'Type' })}: {tItem === 'All' ? t('common.all', { defaultValue: 'All' }) : tItem}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {/* Secondary Filter: Cognitive Care Checkbox */}
          <div className="flex items-center gap-3 pt-2 border-t border-slate-200 text-xs font-bold text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasCognitiveOnly}
                onChange={(e) => setHasCognitiveOnly(e.target.checked)}
                className="w-4 h-4 rounded text-govNavy focus:ring-govNavy"
              />
              <span>{t('portal.cognitiveCareOnly', { defaultValue: 'Show Cognitive Care & Memory Nodes Only' })}</span>
            </label>

            {(selectedState !== 'All' || selectedType !== 'All' || searchQuery || hasCognitiveOnly) && (
              <button
                onClick={() => {
                  setSelectedState('All');
                  setSelectedType('All');
                  setSearchQuery('');
                  setHasCognitiveOnly(false);
                }}
                className="text-red-600 hover:underline font-bold text-xs flex items-center gap-1 ml-auto"
              >
                <X className="w-3.5 h-3.5" /> {t('portal.clearFilters', { defaultValue: 'Clear Filters' })}
              </button>
            )}
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-500 font-semibold text-sm">{t('portal.searchingDirectory', { defaultValue: 'Searching health directory...' })}</p>
          </div>
        ) : facilities.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-3xl border border-slate-200">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-2" />
            <h4 className="font-serif font-bold text-lg text-slate-800">{t('portal.noFacilitiesFound', { defaultValue: 'No Facilities Found' })}</h4>
            <p className="text-slate-500 text-sm">{t('portal.noFacilitiesDesc', { defaultValue: 'Try adjusting your state filter or search terms.' })}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((fac) => (
              <FacilityCard key={fac.id} facility={fac} onOpenDetails={setSelectedFacility} />
            ))}
          </div>
        )}

      </div>

      {/* Facility Details Modal */}
      {selectedFacility && (
        <Modal
          isOpen={!!selectedFacility}
          onClose={() => setSelectedFacility(null)}
          title={selectedFacility.name}
        >
          <div className="space-y-4 text-sm text-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
              <span className="px-3 py-1 bg-govNavy-soft text-govNavy-dark font-bold text-xs rounded-md">
                {selectedFacility.type}
              </span>
              <span className="text-xs font-bold text-slate-500">
                {selectedFacility.district}, {selectedFacility.state}
              </span>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-1">{t('portal.facilityAddressLocation', { defaultValue: 'Facility Address & Location' })}</h4>
              <p className="text-slate-700">{selectedFacility.address}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs font-bold text-slate-500 block">{t('portal.contactPhone', { defaultValue: 'Contact Phone' })}</span>
                <span className="font-bold text-govNavy">{selectedFacility.contactNumber}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-slate-500 block">{t('portal.emergencyLine', { defaultValue: 'Emergency Line' })}</span>
                <span className="font-bold text-red-600">{selectedFacility.emergencyNumber || '108'}</span>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-2">{t('portal.availableServices', { defaultValue: 'Available Healthcare Services' })}</h4>
              <div className="flex flex-wrap items-center gap-2">
                {selectedFacility.services.map((s) => (
                  <span key={s} className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold border border-slate-200">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {selectedFacility.hasCognitiveCare && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2">
                <Heart className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{t('portal.esp32NodeAvailable', { defaultValue: 'Integrated Smriti-Setu Stationary ESP32 Gateway Node Available' })}</span>
              </div>
            )}
          </div>
        </Modal>
      )}

    </section>
  );
};

