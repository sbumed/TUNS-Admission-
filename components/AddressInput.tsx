import React, { useState, useEffect, useMemo } from 'react';
import { Address } from '../types';
import { THAI_PROVINCES, Province } from '../data/provinces';
import { ALL_DISTRICTS, District, SubDistrict, SUBDISTRICTS_BY_DISTRICT_ID } from '../data/addresses';

interface AddressInputProps {
  address: Address;
  onAddressChange: (address: Address) => void;
  title: string;
  placeholder?: string;
  isRequired: boolean;
  provinceLock?: string;
  districtLock?: string[];
  subdistrictLock?: string[];
  isDisabled?: boolean;
}

const AddressInput: React.FC<AddressInputProps> = ({ address, onAddressChange, title, placeholder, isRequired, provinceLock, districtLock, subdistrictLock, isDisabled }) => {
  const allProvinces: Province[] = THAI_PROVINCES;
  const [districtsInProvince, setDistrictsInProvince] = useState<District[]>([]);
  const [subdistricts, setSubdistricts] = useState<SubDistrict[]>([]);

  // Derive the list of provinces to display based on the lock
  const displayedProvinces = useMemo(() => {
    if (provinceLock) {
      return allProvinces.filter(p => p.name_th === provinceLock);
    }
    return allProvinces;
  }, [allProvinces, provinceLock]);

  // Filter districts when province changes
  useEffect(() => {
    if (address.province) {
      const selectedProvince = allProvinces.find(p => p.name_th === address.province);
      if (selectedProvince) {
        const provinceDistricts = ALL_DISTRICTS.filter(d => d.province_id === selectedProvince.id);
        setDistrictsInProvince(provinceDistricts);
        // If the previously selected district is not in the new list, reset it
        if (!provinceDistricts.some(d => d.name_th === address.district)) {
            onAddressChange({ ...address, district: '', subdistrict: '', postalCode: '' });
        }
      } else {
        setDistrictsInProvince([]);
      }
    } else {
      setDistrictsInProvince([]);
    }
  }, [address.province, allProvinces]);

  const displayedDistricts = useMemo(() => {
    if (districtLock && districtLock.length > 0) {
      return districtsInProvince.filter(d => districtLock.includes(d.name_th));
    }
    return districtsInProvince;
  }, [districtsInProvince, districtLock]);

  // Filter subdistricts when district changes
  useEffect(() => {
    if (address.district) {
      const selectedDistrict = districtsInProvince.find(d => d.name_th === address.district);
      if (selectedDistrict) {
        const districtSubdistricts = SUBDISTRICTS_BY_DISTRICT_ID[selectedDistrict.id] || [];
        setSubdistricts(districtSubdistricts);
         // If the previously selected subdistrict is not in the new list, reset it
        if (!districtSubdistricts.some(s => s.name_th === address.subdistrict)) {
            onAddressChange({ ...address, subdistrict: '', postalCode: '' });
        }
      } else {
        setSubdistricts([]);
      }
    } else {
      setSubdistricts([]);
    }
  }, [address.district, districtsInProvince]);

  const displayedSubdistricts = useMemo(() => {
    if (subdistrictLock && subdistrictLock.length > 0) {
        return subdistricts.filter(s => subdistrictLock.includes(s.name_th));
    }
    return subdistricts;
  }, [subdistricts, subdistrictLock]);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvince = e.target.value;
    onAddressChange({
      ...address,
      province: newProvince,
      district: '',
      subdistrict: '',
      postalCode: '',
    });
  };
  
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDistrict = e.target.value;
    onAddressChange({
      ...address,
      district: newDistrict,
      subdistrict: '',
      postalCode: '',
    });
  };
  
  const handleSubdistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSubdistrictName = e.target.value;
    const selectedSubdistrict = subdistricts.find(s => s.name_th === newSubdistrictName);
    onAddressChange({
      ...address,
      subdistrict: newSubdistrictName,
      postalCode: selectedSubdistrict ? String(selectedSubdistrict.zip_code) : '',
    });
  };

  return (
    <div>
      {title && <label className="block text-sm font-medium text-gray-700 mb-1">{title}</label>}
      {placeholder && <p className="text-xs text-gray-500 mb-2">{placeholder}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 border p-4 rounded-lg bg-gray-50/50">
        <input 
          type="text" 
          placeholder="บ้านเลขที่, หมู่, ซอย, ถนน" 
          className="p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 md:col-span-2 disabled:bg-gray-200 disabled:cursor-not-allowed" 
          value={address.detail}
          onChange={e => onAddressChange({ ...address, detail: e.target.value })}
          required={isRequired}
          disabled={isDisabled}
        />
        <select
          className="p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-200 disabled:cursor-not-allowed"
          value={address.province}
          onChange={handleProvinceChange}
          required={isRequired}
          disabled={isDisabled || !!provinceLock}
        >
          <option value="">-- เลือกจังหวัด --</option>
          {displayedProvinces.map(p => <option key={p.id} value={p.name_th}>{p.name_th}</option>)}
        </select>
        <select
          className="p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-200 disabled:cursor-not-allowed"
          value={address.district}
          onChange={handleDistrictChange}
          disabled={isDisabled || !address.province}
          required={isRequired}
        >
          <option value="">-- เลือกอำเภอ/เขต --</option>
          {displayedDistricts.map(d => <option key={d.id} value={d.name_th}>{d.name_th}</option>)}
        </select>
        <select
          className="p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-200 disabled:cursor-not-allowed"
          value={address.subdistrict}
          onChange={handleSubdistrictChange}
          disabled={isDisabled || !address.district}
          required={isRequired}
        >
          <option value="">-- เลือกตำบล/แขวง --</option>
          {displayedSubdistricts.map(s => <option key={s.id} value={s.name_th}>{s.name_th}</option>)}
        </select>
        <input 
          type="text" 
          placeholder="รหัสไปรษณีย์" 
          className="p-3 border rounded-md focus:ring-2 focus:ring-indigo-500 bg-gray-200 disabled:cursor-not-allowed" 
          value={address.postalCode}
          required={isRequired}
          pattern="\d{5}" 
          title="กรุณากรอกรหัสไปรษณีย์ 5 หลัก"
          readOnly
          disabled={isDisabled}
        />
      </div>
    </div>
  );
};
export default AddressInput;