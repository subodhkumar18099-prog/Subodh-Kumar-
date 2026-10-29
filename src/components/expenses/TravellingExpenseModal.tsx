/**
 * Sunvault Expenses Manager - Dedicated Travelling Expense Form
 * Automatically calculates:
 * Total Travelling Expense = Outward Fare + Return Fare + Local Conveyance + Parking + Toll Tax + Other Charges
 * Site Name field is BLANK by default with suggestions.
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { captureCurrentLocation, getGoogleMapsUrl } from '../../utils/geoUtils';
import { Attachment, GpsLocation, TravelDetails } from '../../types';
import {
  X,
  Compass,
  MapPin,
  Upload,
  Receipt,
  Check,
  Building,
  Calendar,
  ExternalLink,
  Trash2,
  FileText,
  AlertTriangle,
} from 'lucide-react';

interface TravellingExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TravellingExpenseModal: React.FC<TravellingExpenseModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, addExpense, knownSites = [] } = useApp();
  const todayStr = new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(todayStr);
  const [employeeName, setEmployeeName] = useState(currentUser?.name || '');
  const [employeeId, setEmployeeId] = useState(currentUser?.employeeId || '');

  // IMPORTANT: Site Name BLANK by default!
  const [siteName, setSiteName] = useState('');
  const [showSiteSuggestions, setShowSiteSuggestions] = useState(false);

  // Travel fields
  const [startingLocation, setStartingLocation] = useState('');
  const [destination, setDestination] = useState('');
  const [travelPurpose, setTravelPurpose] = useState('');
  const [travelMode, setTravelMode] = useState<TravelDetails['travelMode']>('Personal Car');

  // Breakdown Fares
  const [outwardFare, setOutwardFare] = useState<number>(0);
  const [returnFare, setReturnFare] = useState<number>(0);
  const [localConveyance, setLocalConveyance] = useState<number>(0);
  const [parking, setParking] = useState<number>(0);
  const [tollTax, setTollTax] = useState<number>(0);
  const [otherCharges, setOtherCharges] = useState<number>(0);

  const [remarks, setRemarks] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [gpsLocation, setGpsLocation] = useState<GpsLocation | undefined>(undefined);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto calculate: Outward + Return + Local Conveyance + Parking + Toll Tax + Other Charges
  const totalTravellingExpense =
    Number(outwardFare || 0) +
    Number(returnFare || 0) +
    Number(localConveyance || 0) +
    Number(parking || 0) +
    Number(tollTax || 0) +
    Number(otherCharges || 0);

  useEffect(() => {
    if (isOpen && currentUser) {
      setDate(todayStr);
      setEmployeeName(currentUser.name || '');
      setEmployeeId(currentUser.employeeId);
      setSiteName(''); // Ensure blank by default!
      setStartingLocation('Pune Head Office');
      setDestination('');
      setTravelPurpose('');
      setTravelMode('Personal Car');
      setOutwardFare(0);
      setReturnFare(0);
      setLocalConveyance(0);
      setParking(0);
      setTollTax(0);
      setOtherCharges(0);
      setRemarks('');
      setAttachments([]);
      setGpsLocation(undefined);
      setGpsError(null);
      setErrorMsg(null);
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !currentUser) return null;

  const filteredSiteSuggestions = siteName.trim()
    ? knownSites.filter((s: string) => s.toLowerCase().includes(siteName.toLowerCase().trim()))
    : knownSites;

  const handleCaptureGps = async () => {
    setIsLocating(true);
    setGpsError(null);
    try {
      const res = await captureCurrentLocation();
      if (res.error) {
        setGpsError(res.error);
      } else {
        setGpsLocation({
          latitude: res.latitude,
          longitude: res.longitude,
          accuracyMeters: res.accuracyMeters,
          capturedAt: new Date().toLocaleString(),
          address: destination || 'Transit GPS stamp',
        });
      }
    } catch {
      setGpsError('GPS capture failed.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleAddSampleTollTicket = () => {
    const newAtt: Attachment = {
      id: `att-${Date.now()}`,
      name: 'FASTag_Toll_Statement.jpg',
      url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      type: 'image',
      sizeKb: 285,
      uploadedAt: new Date().toLocaleString(),
    };
    setAttachments((prev) => [...prev, newAtt]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!startingLocation.trim() || !destination.trim()) {
      setErrorMsg('Please specify both Starting Location and Destination.');
      return;
    }

    if (!travelPurpose.trim()) {
      setErrorMsg('Please enter the travel purpose (e.g. Inverter commissioning, client meeting, survey).');
      return;
    }

    if (totalTravellingExpense <= 0) {
      setErrorMsg('Total travelling expense must be greater than zero.');
      return;
    }

    const travelDetails: TravelDetails = {
      startingLocation: startingLocation.trim(),
      destination: destination.trim(),
      travelPurpose: travelPurpose.trim(),
      travelMode,
      outwardFare: Number(outwardFare || 0),
      returnFare: Number(returnFare || 0),
      localConveyance: Number(localConveyance || 0),
      parking: Number(parking || 0),
      tollTax: Number(tollTax || 0),
      otherCharges: Number(otherCharges || 0),
    };

    addExpense({
      expenseDate: date,
      employeeName,
      employeeId,
      companyName: 'Sunvault Powertech Pvt. Ltd.',
      siteName: siteName.trim(),
      siteLocation: destination.trim(),
      category: 'Travelling',
      description: `${travelMode}: ${startingLocation} to ${destination} (${travelPurpose})`,
      quantity: 1,
      rate: totalTravellingExpense,
      totalAmount: totalTravellingExpense,
      paymentMode: 'Cash',
      paidBy: 'Employee',
      attachments,
      gpsLocation,
      remarks: remarks.trim(),
      isBillRequired: true,
      approvalStatus: 'Pending Approval',
      travelDetails,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col z-10 overflow-hidden my-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-sky-950 text-white flex items-center justify-between border-b border-sky-900 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-sky-300 font-medium">Sunvault Powertech Field Logistics</div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Travelling Expense Log</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-sky-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Row 1: Date & Employee */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Travel Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Employee Name</label>
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Employee ID</label>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono bg-slate-50 focus:bg-white focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2: Site Name (BLANK BY DEFAULT) */}
          <div className="p-3 bg-sky-50/50 border border-sky-100 rounded-xl relative">
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-900 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-sky-600" />
                Project / Site Name
              </label>
              <span className="text-[10px] text-slate-500">Manual entry · Leave blank for transit/office</span>
            </div>
            <input
              type="text"
              value={siteName}
              onChange={(e) => {
                setSiteName(e.target.value);
                setShowSiteSuggestions(true);
              }}
              onFocus={() => setShowSiteSuggestions(true)}
              placeholder="Enter site name manually (blank by default)..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:border-sky-500 focus:outline-none font-medium"
            />

            {showSiteSuggestions && filteredSiteSuggestions.length > 0 && (
              <div className="absolute left-3 right-3 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-30 max-h-36 overflow-y-auto divide-y divide-slate-100">
                {filteredSiteSuggestions.map((site: string) => (
                  <button
                    key={site}
                    type="button"
                    onClick={() => {
                      setSiteName(site);
                      setShowSiteSuggestions(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-sky-50 text-slate-800 transition-colors"
                  >
                    {site}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Row 3: Itinerary details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Starting Location *</label>
              <input
                type="text"
                required
                value={startingLocation}
                onChange={(e) => setStartingLocation(e.target.value)}
                placeholder="e.g. Pune HO / Home / Hotel"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Destination *</label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Nashik Ambad MIDC / Kolhapur Site"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:border-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 4: Purpose & Travel Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Travel Purpose *</label>
              <input
                type="text"
                required
                value={travelPurpose}
                onChange={(e) => setTravelPurpose(e.target.value)}
                placeholder="e.g. Inverter commissioning, CEIG inspection, site survey"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Travel Mode</label>
              <select
                value={travelMode}
                onChange={(e) => setTravelMode(e.target.value as TravelDetails['travelMode'])}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:border-sky-500 focus:outline-none font-medium"
              >
                <option value="Personal Car">Personal Car (Fuel + Toll)</option>
                <option value="Personal Bike">Personal Bike (Two Wheeler)</option>
                <option value="Bus">Intercity Bus / MSRTC</option>
                <option value="Train">Indian Railways (Train)</option>
                <option value="Taxi / Cab">Taxi / Cab (Ola / Uber / Rental)</option>
                <option value="Auto Rickshaw">Auto Rickshaw (Local)</option>
                <option value="Flight">Domestic Flight</option>
                <option value="Other">Other Transit</option>
              </select>
            </div>
          </div>

          {/* Row 5: Detailed Fare Breakdown Matrix */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="font-bold text-slate-900">Fare Breakdown & Incidental Charges</span>
              <span className="text-[11px] text-slate-500">Itemized reimbursable fares</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-600 mb-1">Outward Fare (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={outwardFare || ''}
                  onChange={(e) => setOutwardFare(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono tabular-nums bg-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Return Fare (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={returnFare || ''}
                  onChange={(e) => setReturnFare(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono tabular-nums bg-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Local Conveyance (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={localConveyance || ''}
                  onChange={(e) => setLocalConveyance(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono tabular-nums bg-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Parking Charges (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={parking || ''}
                  onChange={(e) => setParking(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono tabular-nums bg-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Toll Tax (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={tollTax || ''}
                  onChange={(e) => setTollTax(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono tabular-nums bg-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-600 mb-1">Other Charges (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={otherCharges || ''}
                  onChange={(e) => setOtherCharges(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-mono tabular-nums bg-white focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Total Travelling Expense Highlight Card */}
            <div className="mt-3 p-3 bg-sky-900 text-white rounded-xl flex items-center justify-between">
              <div>
                <span className="text-[11px] text-sky-300 font-medium uppercase tracking-wider block">
                  Total Travelling Expense
                </span>
                <span className="text-[10px] text-sky-200">
                  Outward + Return + Local + Parking + Toll + Other
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-amber-400">
                ₹{totalTravellingExpense.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Row 6: GPS & Tickets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* GPS */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                  GPS Location
                </span>
                <button
                  type="button"
                  onClick={handleCaptureGps}
                  disabled={isLocating}
                  className="text-[10px] px-2.5 py-1 bg-white border border-slate-300 rounded font-medium hover:border-sky-500"
                >
                  {isLocating ? 'Capturing...' : 'Capture GPS'}
                </button>
              </div>
              {gpsLocation ? (
                <div className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-200">
                  Lat: {gpsLocation.latitude} · Long: {gpsLocation.longitude}
                </div>
              ) : (
                <div className="text-[11px] text-slate-400">Optional: Stamp transit location</div>
              )}
            </div>

            {/* Tickets */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-sky-600" />
                  Tickets / FASTag
                </span>
                <button
                  type="button"
                  onClick={handleAddSampleTollTicket}
                  className="text-[10px] px-2.5 py-1 bg-white border border-slate-300 rounded font-medium hover:border-sky-500"
                >
                  + Sample FASTag
                </button>
              </div>
              <div className="text-[11px] text-slate-500">
                {attachments.length} attachment(s) included
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Remarks</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Fuel receipt #8812, FASTag auto-deduction"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white focus:border-sky-500 focus:outline-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Multiple travelling logs allowed on same date
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Save Travel Claim</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
