"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  IconUser, IconPhone, IconMail, IconUpload, IconLoader2, IconCheck, IconX,
  IconAlertCircle, IconShieldCheck, IconArrowRight, IconArrowLeft,
  IconSend, IconClock, IconFile, IconAlertTriangle,
  IconChevronDown, IconSearch, IconRefresh,
} from "@tabler/icons-react";
import { kycAPI, type KycData } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Step = 1 | 2 | 3 | 4 | 5;

const COUNTRY_CODES = [
  { code: "+1", country: "USA", flag: "🇺🇸" },
  { code: "+1", country: "Canada", flag: "🇨🇦" },
  { code: "+1", country: "Jamaica", flag: "🇯🇲" },
  { code: "+1", country: "Trinidad & Tobago", flag: "🇹🇹" },
  { code: "+1", country: "Barbados", flag: "🇧🇧" },
  { code: "+7", country: "Russia", flag: "🇷🇺" },
  { code: "+20", country: "Egypt", flag: "🇪🇬" },
  { code: "+27", country: "South Africa", flag: "🇿🇦" },
  { code: "+30", country: "Greece", flag: "🇬🇷" },
  { code: "+31", country: "Netherlands", flag: "🇳🇱" },
  { code: "+32", country: "Belgium", flag: "🇧🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "+36", country: "Hungary", flag: "🇭🇺" },
  { code: "+39", country: "Italy", flag: "🇮🇹" },
  { code: "+40", country: "Romania", flag: "🇷🇴" },
  { code: "+41", country: "Switzerland", flag: "🇨🇭" },
  { code: "+43", country: "Austria", flag: "🇦🇹" },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧" },
  { code: "+45", country: "Denmark", flag: "🇩🇰" },
  { code: "+46", country: "Sweden", flag: "🇸🇪" },
  { code: "+47", country: "Norway", flag: "🇳🇴" },
  { code: "+48", country: "Poland", flag: "🇵🇱" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+51", country: "Peru", flag: "🇵🇪" },
  { code: "+52", country: "Mexico", flag: "🇲🇽" },
  { code: "+53", country: "Cuba", flag: "🇨🇺" },
  { code: "+54", country: "Argentina", flag: "🇦🇷" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+56", country: "Chile", flag: "🇨🇱" },
  { code: "+57", country: "Colombia", flag: "🇨🇴" },
  { code: "+58", country: "Venezuela", flag: "🇻🇪" },
  { code: "+60", country: "Malaysia", flag: "🇲🇾" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+62", country: "Indonesia", flag: "🇮🇩" },
  { code: "+63", country: "Philippines", flag: "🇵🇭" },
  { code: "+64", country: "New Zealand", flag: "🇳🇿" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+66", country: "Thailand", flag: "🇹🇭" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+82", country: "South Korea", flag: "🇰🇷" },
  { code: "+84", country: "Vietnam", flag: "🇻🇳" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+90", country: "Turkey", flag: "🇹🇷" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+92", country: "Pakistan", flag: "🇵🇰" },
  { code: "+93", country: "Afghanistan", flag: "🇦🇫" },
  { code: "+94", country: "Sri Lanka", flag: "🇱🇰" },
  { code: "+95", country: "Myanmar", flag: "🇲🇲" },
  { code: "+98", country: "Iran", flag: "🇮🇷" },
  { code: "+211", country: "South Sudan", flag: "🇸🇸" },
  { code: "+212", country: "Morocco", flag: "🇲🇦" },
  { code: "+213", country: "Algeria", flag: "🇩🇿" },
  { code: "+216", country: "Tunisia", flag: "🇹🇳" },
  { code: "+218", country: "Libya", flag: "🇱🇾" },
  { code: "+220", country: "Gambia", flag: "🇬🇲" },
  { code: "+221", country: "Senegal", flag: "🇸🇳" },
  { code: "+222", country: "Mauritania", flag: "🇲🇷" },
  { code: "+223", country: "Mali", flag: "🇲🇱" },
  { code: "+224", country: "Guinea", flag: "🇬🇳" },
  { code: "+225", country: "Ivory Coast", flag: "🇨🇮" },
  { code: "+226", country: "Burkina Faso", flag: "🇧🇫" },
  { code: "+227", country: "Niger", flag: "🇳🇪" },
  { code: "+228", country: "Togo", flag: "🇹🇬" },
  { code: "+229", country: "Benin", flag: "🇧🇯" },
  { code: "+230", country: "Mauritius", flag: "🇲🇺" },
  { code: "+231", country: "Liberia", flag: "🇱🇷" },
  { code: "+232", country: "Sierra Leone", flag: "🇸🇱" },
  { code: "+233", country: "Ghana", flag: "🇬🇭" },
  { code: "+234", country: "Nigeria", flag: "🇳🇬" },
  { code: "+235", country: "Chad", flag: "🇹🇩" },
  { code: "+236", country: "Central African Republic", flag: "🇨🇫" },
  { code: "+237", country: "Cameroon", flag: "🇨🇲" },
  { code: "+238", country: "Cape Verde", flag: "🇨🇻" },
  { code: "+239", country: "São Tomé & Príncipe", flag: "🇸🇹" },
  { code: "+240", country: "Equatorial Guinea", flag: "🇬🇶" },
  { code: "+241", country: "Gabon", flag: "🇬🇦" },
  { code: "+242", country: "Congo", flag: "🇨🇬" },
  { code: "+243", country: "DR Congo", flag: "🇨🇩" },
  { code: "+244", country: "Angola", flag: "🇦🇴" },
  { code: "+245", country: "Guinea-Bissau", flag: "🇬🇼" },
  { code: "+246", country: "Diego Garcia", flag: "🇮🇴" },
  { code: "+248", country: "Seychelles", flag: "🇸🇨" },
  { code: "+249", country: "Sudan", flag: "🇸🇩" },
  { code: "+250", country: "Rwanda", flag: "🇷🇼" },
  { code: "+251", country: "Ethiopia", flag: "🇪🇹" },
  { code: "+252", country: "Somalia", flag: "🇸🇴" },
  { code: "+253", country: "Djibouti", flag: "🇩🇯" },
  { code: "+254", country: "Kenya", flag: "🇰🇪" },
  { code: "+255", country: "Tanzania", flag: "🇹🇿" },
  { code: "+256", country: "Uganda", flag: "🇺🇬" },
  { code: "+257", country: "Burundi", flag: "🇧🇮" },
  { code: "+258", country: "Mozambique", flag: "🇲🇿" },
  { code: "+260", country: "Zambia", flag: "🇿🇲" },
  { code: "+261", country: "Madagascar", flag: "🇲🇬" },
  { code: "+262", country: "Réunion", flag: "🇷🇪" },
  { code: "+263", country: "Zimbabwe", flag: "🇿🇼" },
  { code: "+264", country: "Namibia", flag: "🇳🇦" },
  { code: "+265", country: "Malawi", flag: "🇲🇼" },
  { code: "+266", country: "Lesotho", flag: "🇱🇸" },
  { code: "+267", country: "Botswana", flag: "🇧🇼" },
  { code: "+268", country: "Eswatini", flag: "🇸🇿" },
  { code: "+269", country: "Comoros", flag: "🇰🇲" },
  { code: "+290", country: "Saint Helena", flag: "🇸🇭" },
  { code: "+291", country: "Eritrea", flag: "🇪🇷" },
  { code: "+297", country: "Aruba", flag: "🇦🇼" },
  { code: "+298", country: "Faroe Islands", flag: "🇫🇴" },
  { code: "+299", country: "Greenland", flag: "🇬🇱" },
  { code: "+350", country: "Gibraltar", flag: "🇬🇮" },
  { code: "+351", country: "Portugal", flag: "🇵🇹" },
  { code: "+352", country: "Luxembourg", flag: "🇱🇺" },
  { code: "+353", country: "Ireland", flag: "🇮🇪" },
  { code: "+354", country: "Iceland", flag: "🇮🇸" },
  { code: "+355", country: "Albania", flag: "🇦🇱" },
  { code: "+356", country: "Malta", flag: "🇲🇹" },
  { code: "+357", country: "Cyprus", flag: "🇨🇾" },
  { code: "+358", country: "Finland", flag: "🇫🇮" },
  { code: "+359", country: "Bulgaria", flag: "🇧🇬" },
  { code: "+370", country: "Lithuania", flag: "🇱🇹" },
  { code: "+371", country: "Latvia", flag: "🇱🇻" },
  { code: "+372", country: "Estonia", flag: "🇪🇪" },
  { code: "+373", country: "Moldova", flag: "🇲🇩" },
  { code: "+374", country: "Armenia", flag: "🇦🇲" },
  { code: "+375", country: "Belarus", flag: "🇧🇾" },
  { code: "+376", country: "Andorra", flag: "🇦🇩" },
  { code: "+377", country: "Monaco", flag: "🇲🇨" },
  { code: "+378", country: "San Marino", flag: "🇸🇲" },
  { code: "+379", country: "Vatican City", flag: "🇻🇦" },
  { code: "+380", country: "Ukraine", flag: "🇺🇦" },
  { code: "+381", country: "Serbia", flag: "🇷🇸" },
  { code: "+382", country: "Montenegro", flag: "🇲🇪" },
  { code: "+383", country: "Kosovo", flag: "🇽🇰" },
  { code: "+385", country: "Croatia", flag: "🇭🇷" },
  { code: "+386", country: "Slovenia", flag: "🇸🇮" },
  { code: "+387", country: "Bosnia & Herzegovina", flag: "🇧🇦" },
  { code: "+389", country: "North Macedonia", flag: "🇲🇰" },
  { code: "+390", country: "Italy", flag: "🇮🇹" },
  { code: "+420", country: "Czech Republic", flag: "🇨🇿" },
  { code: "+421", country: "Slovakia", flag: "🇸🇰" },
  { code: "+423", country: "Liechtenstein", flag: "🇱🇮" },
  { code: "+500", country: "Falkland Islands", flag: "🇫🇰" },
  { code: "+501", country: "Belize", flag: "🇧🇿" },
  { code: "+502", country: "Guatemala", flag: "🇬🇹" },
  { code: "+503", country: "El Salvador", flag: "🇸🇻" },
  { code: "+504", country: "Honduras", flag: "🇭🇳" },
  { code: "+505", country: "Nicaragua", flag: "🇳🇮" },
  { code: "+506", country: "Costa Rica", flag: "🇨🇷" },
  { code: "+507", country: "Panama", flag: "🇵🇦" },
  { code: "+508", country: "Saint Pierre & Miquelon", flag: "🇵🇲" },
  { code: "+509", country: "Haiti", flag: "🇭🇹" },
  { code: "+590", country: "Guadeloupe", flag: "🇬🇵" },
  { code: "+591", country: "Bolivia", flag: "🇧🇴" },
  { code: "+592", country: "Guyana", flag: "🇬🇾" },
  { code: "+593", country: "Ecuador", flag: "🇪🇨" },
  { code: "+594", country: "French Guiana", flag: "🇬🇫" },
  { code: "+595", country: "Paraguay", flag: "🇵🇾" },
  { code: "+596", country: "Martinique", flag: "🇲🇶" },
  { code: "+597", country: "Suriname", flag: "🇸🇷" },
  { code: "+598", country: "Uruguay", flag: "🇺🇾" },
  { code: "+599", country: "Curaçao", flag: "🇨🇼" },
  { code: "+670", country: "East Timor", flag: "🇹🇱" },
  { code: "+672", country: "Norfolk Island", flag: "🇳🇫" },
  { code: "+673", country: "Brunei", flag: "🇧🇳" },
  { code: "+674", country: "Nauru", flag: "🇳🇷" },
  { code: "+675", country: "Papua New Guinea", flag: "🇵🇬" },
  { code: "+676", country: "Tonga", flag: "🇹🇴" },
  { code: "+677", country: "Solomon Islands", flag: "🇸🇧" },
  { code: "+678", country: "Vanuatu", flag: "🇻🇺" },
  { code: "+679", country: "Fiji", flag: "🇫🇯" },
  { code: "+680", country: "Palau", flag: "🇵🇼" },
  { code: "+681", country: "Wallis & Futuna", flag: "🇼🇫" },
  { code: "+682", country: "Cook Islands", flag: "🇨🇰" },
  { code: "+683", country: "Niue", flag: "🇳🇺" },
  { code: "+684", country: "American Samoa", flag: "🇦🇸" },
  { code: "+685", country: "Samoa", flag: "🇼🇸" },
  { code: "+686", country: "Kiribati", flag: "🇰🇮" },
  { code: "+687", country: "New Caledonia", flag: "🇳🇨" },
  { code: "+688", country: "Tuvalu", flag: "🇹🇻" },
  { code: "+689", country: "French Polynesia", flag: "🇵🇫" },
  { code: "+690", country: "Tokelau", flag: "🇹🇰" },
  { code: "+691", country: "Micronesia", flag: "🇫🇲" },
  { code: "+692", country: "Marshall Islands", flag: "🇲🇭" },
  { code: "+850", country: "North Korea", flag: "🇰🇵" },
  { code: "+852", country: "Hong Kong", flag: "🇭🇰" },
  { code: "+853", country: "Macau", flag: "🇲🇴" },
  { code: "+855", country: "Cambodia", flag: "🇰🇭" },
  { code: "+856", country: "Laos", flag: "🇱🇦" },
  { code: "+880", country: "Bangladesh", flag: "🇧🇩" },
  { code: "+886", country: "Taiwan", flag: "🇹🇼" },
  { code: "+960", country: "Maldives", flag: "🇲🇻" },
  { code: "+961", country: "Lebanon", flag: "🇱🇧" },
  { code: "+962", country: "Jordan", flag: "🇯🇴" },
  { code: "+963", country: "Syria", flag: "🇸🇾" },
  { code: "+964", country: "Iraq", flag: "🇮🇶" },
  { code: "+965", country: "Kuwait", flag: "🇰🇼" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+967", country: "Yemen", flag: "🇾🇪" },
  { code: "+968", country: "Oman", flag: "🇴🇲" },
  { code: "+970", country: "Palestine", flag: "🇵🇸" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+972", country: "Israel", flag: "🇮🇱" },
  { code: "+973", country: "Bahrain", flag: "🇧🇭" },
  { code: "+974", country: "Qatar", flag: "🇶🇦" },
  { code: "+975", country: "Bhutan", flag: "🇧🇹" },
  { code: "+976", country: "Mongolia", flag: "🇲🇳" },
  { code: "+977", country: "Nepal", flag: "🇳🇵" },
  { code: "+992", country: "Tajikistan", flag: "🇹🇯" },
  { code: "+993", country: "Turkmenistan", flag: "🇹🇲" },
  { code: "+994", country: "Azerbaijan", flag: "🇦🇿" },
  { code: "+995", country: "Georgia", flag: "🇬🇪" },
  { code: "+996", country: "Kyrgyzstan", flag: "🇰🇬" },
  { code: "+998", country: "Uzbekistan", flag: "🇺🇿" },
];

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia",
  "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados",
  "Belarus", "Belgium", "Belize", "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina",
  "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia",
  "Comoros", "Congo", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic",
  "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
  "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala",
  "Guinea", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India",
  "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan",
  "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea (North)", "Korea (South)",
  "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia",
  "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
  "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania",
  "Mauritius", "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro",
  "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands",
  "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan",
  "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland",
  "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis",
  "Saint Lucia", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia",
  "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia",
  "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Sudan", "Spain",
  "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan",
  "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago",
  "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe",
];

const ID_TYPES: Record<string, string[]> = {
  India: ["Aadhaar Card", "PAN Card", "Voter ID", "Passport", "Driving Licence"],
  "United States": ["Driver's License", "Passport", "State ID", "Military ID"],
  "United Kingdom": ["Passport", "Driving Licence", "BRP", "National ID Card"],
  Canada: ["Passport", "Driver's License", "Provincial ID", "Health Card"],
  Australia: ["Passport", "Driver's License", "Proof of Age Card", "Medicare Card"],
  Germany: ["Passport", "Personalausweis", "Driver's License", "Residence Permit"],
  France: ["Passport", "Carte Nationale d'Identité", "Driver's License", "Carte de Séjour"],
  Japan: ["Passport", "My Number Card", "Driver's License", "Residence Card"],
  Singapore: ["Passport", "NRIC", "Employment Pass", "S Pass", "Work Permit"],
  "United Arab Emirates": ["Passport", "Emirates ID", "Residence Visa"],
  "Saudi Arabia": ["Passport", "National ID", "Iqama", "Driver's License"],
  Brazil: ["Passport", "RG (National ID)", "Driver's License", "CPF Card"],
  Mexico: ["Passport", "INE/IFE", "Driver's License", "CURP"],
  "South Africa": ["Passport", "Smart ID Card", "Driver's License"],
  Nigeria: ["Passport", "National ID (NIN)", "Voter's Card", "Driver's License"],
  Kenya: ["Passport", "National ID", "Driver's License", "Alien Card"],
  Egypt: ["Passport", "National ID", "Driver's License"],
  Pakistan: ["Passport", "CNIC", "SMART Card", "Driver's License"],
  Bangladesh: ["Passport", "National ID (NID)", "Driving Licence", "Birth Certificate"],
  "Sri Lanka": ["Passport", "National ID Card", "Driving Licence"],
  Nepal: ["Passport", "Citizenship Card", "Driver's License"],
  Turkey: ["Passport", "National ID Card", "Driver's License"],
  Indonesia: ["Passport", "KTP (National ID)", "Driver's License", "SIM"],
  Thailand: ["Passport", "Thai ID Card", "Driver's License"],
  Philippines: ["Passport", "National ID (PhilSys)", "Driver's License", "SSS ID"],
  Vietnam: ["Passport", "Citizen Identity Card", "Driver's License"],
  Malaysia: ["Passport", "MyKad", "Driver's License"],
  China: ["Passport", "Resident Identity Card"],
  "South Korea": ["Passport", "Resident Registration Card", "Driver's License"],
  Russia: ["Passport", "Internal Passport", "Driver's License"],
  Ukraine: ["Passport", "Internal ID", "Driver's License"],
  Poland: ["Passport", "Personal ID Card", "Driver's License"],
  Italy: ["Passport", "Carta d'Identità", "Driver's License"],
  Spain: ["Passport", "DNI", "TIE", "Driver's License"],
  Netherlands: ["Passport", "ID Card", "Driver's License"],
  Sweden: ["Passport", "National ID Card", "Driver's License"],
  Norway: ["Passport", "National ID Card", "Driver's License"],
  Denmark: ["Passport", "National ID Card", "Driver's License"],
  Finland: ["Passport", "Identity Card", "Driver's License"],
  Switzerland: ["Passport", "Identity Card", "Driver's License"],
  Austria: ["Passport", "Identity Card", "Driver's License"],
  Belgium: ["Passport", "Identity Card", "Driver's License"],
  Portugal: ["Passport", "Bilhete de Identidade", "Driver's License"],
  Greece: ["Passport", "National ID Card", "Driver's License"],
  "New Zealand": ["Passport", "Firearms Licence", "Driver's License"],
  Ireland: ["Passport", "National ID Card", "Driver's License"],
  Israel: ["Passport", "Teudat Zehut", "Driver's License"],
  "Hong Kong": ["Passport", "HKID Card"],
  Taiwan: ["Passport", "National ID Card", "Driver's License"],
  Qatar: ["Passport", "Qatar ID", "Driver's License"],
  Kuwait: ["Passport", "Civil ID", "Driver's License"],
  Bahrain: ["Passport", "CPR Card", "Driver's License"],
  Oman: ["Passport", "Civil ID", "Driver's License"],
  Jordan: ["Passport", "National ID Card", "Driver's License"],
  Lebanon: ["Passport", "ID Card", "Driver's License"],
  Iraq: ["Passport", "National ID Card"],
  Iran: ["Passport", "National ID Card", "Driver's License"],
  Morocco: ["Passport", "National ID Card", "Driver's License"],
  Algeria: ["Passport", "National ID Card", "Driver's License"],
  Tunisia: ["Passport", "National ID Card", "Driver's License"],
  Libya: ["Passport", "National ID Card"],
  Sudan: ["Passport", "National ID Card"],
  Ethiopia: ["Passport", "National ID Card", "Kebele ID"],
  Tanzania: ["Passport", "National ID Card (NIDA)", "Driver's License"],
  Uganda: ["Passport", "National ID Card (NIN)", "Driver's License"],
  Rwanda: ["Passport", "National ID Card", "Driver's License"],
  "DR Congo": ["Passport", "National ID Card"],
  Angola: ["Passport", "Bilhete de Identidade"],
  Mozambique: ["Passport", "Bilhete de Identidade"],
  Zambia: ["Passport", "National Registration Card (NRC)", "Driver's License"],
  Zimbabwe: ["Passport", "National ID Card", "Driver's License"],
  Botswana: ["Passport", "Omang Card", "Driver's License"],
  Namibia: ["Passport", "National ID Card", "Driver's License"],
  Mauritius: ["Passport", "National ID Card"],
  Seychelles: ["Passport", "National ID Card"],
};

const DEFAULT_ID_TYPES = ["Passport", "National ID", "Driver's License"];

const ADDRESS_PROOF_TYPES = [
  "Utility Bill",
  "Bank Statement",
  "Rent Agreement",
  "Insurance Policy",
  "Government Letter",
  "Voter Registration",
];

const STEP_TITLES: Record<Step, string> = {
  1: "Personal Information",
  2: "Email Verification",
  3: "Government ID",
  4: "Address Proof",
  5: "Review & Submit",
};

function calculateAge(dob: string): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export default function KycPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [kyc, setKyc] = useState<KycData | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  // Step 1 state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");
  const [ccSearch, setCcSearch] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [country, setCountry] = useState("");

  // Step 2 state - Email OTP
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Step 3 state - Government ID
  const [idType, setIdType] = useState("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentPreview, setDocumentPreview] = useState<string | null>(null);
  const [documentFileBack, setDocumentFileBack] = useState<File | null>(null);
  const [documentPreviewBack, setDocumentPreviewBack] = useState<string | null>(null);
  const [dragActiveFront, setDragActiveFront] = useState(false);
  const [dragActiveBack, setDragActiveBack] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputRefBack = useRef<HTMLInputElement>(null);

  // Step 4 state - Address Proof
  const [addressProofType, setAddressProofType] = useState("");
  const [addressFile, setAddressFile] = useState<File | null>(null);
  const [addressPreview, setAddressPreview] = useState<string | null>(null);
  const [addressFileBack, setAddressFileBack] = useState<File | null>(null);
  const [addressPreviewBack, setAddressPreviewBack] = useState<string | null>(null);
  const [dragActiveAddrFront, setDragActiveAddrFront] = useState(false);
  const [dragActiveAddrBack, setDragActiveAddrBack] = useState(false);
  const addrFileInputRef = useRef<HTMLInputElement>(null);
  const addrFileInputRefBack = useRef<HTMLInputElement>(null);

  // Step 4
  const [submitted, setSubmitted] = useState(false);

  // Age check
  const age = calculateAge(dob);
  const isUnder18 = age !== null && age < 18;

  // ─── DOB selects (Year / Month / Day) ───
  const daysInMonth = (y: string, m: string) => {
    if (!y || !m) return 31;
    return new Date(parseInt(y), parseInt(m), 0).getDate();
  };

  const setDobPart = (part: "y" | "m" | "d", value: string) => {
    const y = part === "y" ? value : dobYear;
    const m = part === "m" ? value : dobMonth;
    const d = part === "d" ? value : dobDay;

    if (part === "y") setDobYear(value);
    if (part === "m") setDobMonth(value);
    if (part === "d") setDobDay(value);

    if (y && m && d) {
      // Clamp day if month changed and previous day invalid
      const max = daysInMonth(y, m);
      const finalDay = parseInt(d) > max ? String(max).padStart(2, "0") : d.padStart(2, "0");
      if (finalDay !== d) {
        setDobDay(finalDay);
      }
      setDob(`${y}-${m.padStart(2, "0")}-${finalDay}`);
    } else {
      setDob("");
    }
  };

  const CURRENT_YEAR = new Date().getFullYear();
  const MAX_YEAR = CURRENT_YEAR - 18;
  const YEARS = Array.from({ length: MAX_YEAR - 1949 }, (_, i) => String(MAX_YEAR - i));
  const MONTHS = [
    { value: "01", label: "January" }, { value: "02", label: "February" },
    { value: "03", label: "March" }, { value: "04", label: "April" },
    { value: "05", label: "May" }, { value: "06", label: "June" },
    { value: "07", label: "July" }, { value: "08", label: "August" },
    { value: "09", label: "September" }, { value: "10", label: "October" },
    { value: "11", label: "November" }, { value: "12", label: "December" },
  ];
  const DAYS = Array.from({ length: daysInMonth(dobYear, dobMonth) }, (_, i) => String(i + 1).padStart(2, "0"));

  useEffect(() => {
    fetchKyc();
  }, []);

  const fetchKyc = async () => {
    try {
      setFetching(true);
      const res = await kycAPI.getStatus();
      setKyc(res.kyc);
      if (res.kyc.fullName) setFullName(res.kyc.fullName);
      if (res.kyc.phone) setPhone(res.kyc.phone);
      if (res.kyc.countryCode) setCountryCode(res.kyc.countryCode);
      if (res.kyc.gender) setGender(res.kyc.gender);
      if (res.kyc.dateOfBirth) {
        setDob(res.kyc.dateOfBirth);
        const parts = res.kyc.dateOfBirth.split("-");
        if (parts[0]) setDobYear(parts[0]);
        if (parts[1]) setDobMonth(parts[1]);
        if (parts[2]) setDobDay(parts[2]);
      }
      if (res.kyc.country) setCountry(res.kyc.country);
      if (res.kyc.governmentIdType) setIdType(res.kyc.governmentIdType);
      if (res.kyc.emailVerified) setOtpSuccess(true);
    } catch {
      // KYC not started
    } finally {
      setFetching(false);
    }
  };

  const getIdTypes = useCallback(() => {
    if (country && ID_TYPES[country]) return ID_TYPES[country];
    return DEFAULT_ID_TYPES;
  }, [country]);

  const canResubmit = useCallback(() => {
    if (!kyc || kyc.status !== "REJECTED") return false;
    if (!kyc.resubmitAfter) return true;
    return new Date() >= new Date(kyc.resubmitAfter);
  }, [kyc]);

  const selectedCountryCode = COUNTRY_CODES.find((cc) => cc.code === countryCode);
  const filteredCountryCodes = COUNTRY_CODES.filter(
    (cc) =>
      cc.country.toLowerCase().includes(ccSearch.toLowerCase()) ||
      cc.code.includes(ccSearch)
  );

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newDigits = [...otpDigits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSendOtp = async () => {
    setOtpLoading(true);
    setOtpError("");
    try {
      await kycAPI.sendEmailOtp();
      setOtpSent(true);
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otp = otpDigits.join("");
    if (otp.length !== 6) {
      setOtpError("Enter all 6 digits");
      return;
    }
    setOtpLoading(true);
    setOtpError("");
    try {
      await kycAPI.verifyEmailOtp(otp);
      setOtpSuccess(true);
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleFile = (file: File, side: "front" | "back") => {
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be less than 5MB");
      return;
    }
    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setError("File must be JPEG, PNG, WebP, or PDF");
      return;
    }
    if (side === "front") {
      setDocumentFile(file);
      setError("");
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setDocumentPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setDocumentPreview(null);
      }
    } else {
      setDocumentFileBack(file);
      setError("");
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setDocumentPreviewBack(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setDocumentPreviewBack(null);
      }
    }
  };

  const handleDrag = (e: React.DragEvent, side: "front" | "back") => {
    e.preventDefault();
    e.stopPropagation();
    if (side === "front") {
      if (e.type === "dragenter" || e.type === "dragover") setDragActiveFront(true);
      if (e.type === "dragleave") setDragActiveFront(false);
    } else {
      if (e.type === "dragenter" || e.type === "dragover") setDragActiveBack(true);
      if (e.type === "dragleave") setDragActiveBack(false);
    }
  };

  const handleDrop = (e: React.DragEvent, side: "front" | "back") => {
    e.preventDefault();
    e.stopPropagation();
    if (side === "front") setDragActiveFront(false);
    else setDragActiveBack(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0], side);
  };

  const handleAddressFile = (file: File, side: "front" | "back") => {
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be less than 5MB");
      return;
    }
    const validTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!validTypes.includes(file.type)) {
      setError("File must be JPEG, PNG, WebP, or PDF");
      return;
    }
    if (side === "front") {
      setAddressFile(file);
      setError("");
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setAddressPreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setAddressPreview(null);
      }
    } else {
      setAddressFileBack(file);
      setError("");
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => setAddressPreviewBack(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setAddressPreviewBack(null);
      }
    }
  };

  const handleAddressDrag = (e: React.DragEvent, side: "front" | "back") => {
    e.preventDefault();
    e.stopPropagation();
    if (side === "front") {
      if (e.type === "dragenter" || e.type === "dragover") setDragActiveAddrFront(true);
      if (e.type === "dragleave") setDragActiveAddrFront(false);
    } else {
      if (e.type === "dragenter" || e.type === "dragover") setDragActiveAddrBack(true);
      if (e.type === "dragleave") setDragActiveAddrBack(false);
    }
  };

  const handleAddressDrop = (e: React.DragEvent, side: "front" | "back") => {
    e.preventDefault();
    e.stopPropagation();
    if (side === "front") setDragActiveAddrFront(false);
    else setDragActiveAddrBack(false);
    if (e.dataTransfer.files?.[0]) handleAddressFile(e.dataTransfer.files[0], side);
  };

  const handleSubmit = async () => {
    if (!fullName || !phone || !gender || !dob || !country || !idType || !documentFile || !documentFileBack || !addressProofType || !addressFile || !addressFileBack) {
      setError("Please fill all fields and upload all required documents");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("phone", phone);
      formData.append("countryCode", countryCode);
      formData.append("gender", gender);
      formData.append("dateOfBirth", dob);
      formData.append("country", country);
      formData.append("governmentIdType", idType);
      formData.append("addressProofType", addressProofType);
      formData.append("documentFront", documentFile);
      formData.append("documentBack", documentFileBack);
      formData.append("addressFront", addressFile);
      formData.append("addressBack", addressFileBack);
      await kycAPI.submit(formData);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  // Ek baar submit karne ke baad form dobara nahi dikhega — sirf status
  const kycStatus = kyc?.status ?? "NOT_STARTED";
  const showForm =
    kycStatus === "NOT_STARTED" || (kycStatus === "REJECTED" && canResubmit());

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
          KYC Verification
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {submitted
            ? "Your documents have been submitted for review"
            : showForm
              ? `Step ${step} of 4 — ${STEP_TITLES[step]}`
              : "Track your verification status"}
        </p>
      </div>

      {/* Step Indicators — sirf form mode mein */}
      {!submitted && showForm && (
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex-1">
              <div
                className={`h-1.5 rounded-full transition-colors ${s <= step ? "bg-brand" : "bg-muted"
                  }`}
              />
              <p
                className={`mt-1.5 hidden sm:block text-[11px] font-medium ${s === step ? "text-foreground" : "text-muted-foreground"
                  }`}
              >
                {STEP_TITLES[s as Step]}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Rejection reminder — resubmission form ke upar */}
      {showForm && kyc?.status === "REJECTED" && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <div className="flex items-center gap-2">
            <IconX className="h-4 w-4 shrink-0" />
            <span className="font-medium">Your previous submission was rejected</span>
          </div>
          {kyc.rejectionReason && (
            <p className="mt-1 text-xs opacity-80">Reason: {kyc.rejectionReason}</p>
          )}
          <p className="mt-1 text-xs opacity-80">
            Please correct the issues and resubmit your documents.
          </p>
        </div>
      )}

      {/* Under 18 Block */}
      {showForm && isUnder18 && step >= 1 && !submitted && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-4">
          <div className="flex items-start gap-3">
            <IconAlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                Age Restriction
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                You must be <strong>18 years or older</strong> to complete KYC
                verification. Our platform is not available for users under 18.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="rounded-xl border bg-card shadow-sm p-4 sm:p-6 lg:p-8">
        {submitted ? (
          <div className="space-y-6 text-center py-4">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <IconCheck className="h-10 w-10 text-emerald-500" />
            </div>
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                KYC Submitted!
              </h2>
              <p className="mt-3 text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
                Our team will review your documents within 12-24 working hours.
                You&apos;ll receive an email once verified.
              </p>
            </div>
            <Button asChild className="w-full sm:w-auto btn-glow btn-glow-hover border-0">
              <Link href="/dashboard">
                Back to Dashboard
                <IconArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        ) : !showForm ? (
          /* ─── Status View — form dobara nahi, sirf status ─── */
          <div className="space-y-6 text-center py-4">
            {kycStatus === "PENDING" && (
              <>
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-amber-500/10 ring-1 ring-amber-500/20">
                  <IconClock className="h-10 w-10 text-amber-500" />
                </div>
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                    KYC Under Review
                  </h2>
                  <p className="mt-3 text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
                    Your documents were submitted
                    {kyc?.createdAt
                      ? ` on ${format(new Date(kyc.createdAt), "PPP")}`
                      : ""}
                    . Our team will review them within{" "}
                    <strong className="text-foreground">12-24 working hours</strong>.
                    You&apos;ll receive an email once verified.
                  </p>
                </div>
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2">
                  <IconClock className="h-4 w-4 shrink-0" />
                  Estimated review time: 12-24 working hours
                </div>
                <Button variant="outline" onClick={fetchKyc} className="w-full sm:w-auto">
                  <IconRefresh className="mr-2 h-4 w-4" />
                  Refresh Status
                </Button>
              </>
            )}

            {kycStatus === "APPROVED" && (
              <>
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
                  <IconShieldCheck className="h-10 w-10 text-emerald-500" />
                </div>
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                    KYC Approved!
                  </h2>
                  <p className="mt-3 text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
                    Your identity has been verified. You now have full access to
                    deposits, withdrawals, and all wallet features.
                  </p>
                </div>
                <Button asChild className="w-full sm:w-auto btn-glow btn-glow-hover border-0">
                  <Link href="/dashboard/wallet">
                    Go to Wallet
                    <IconArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}

            {kycStatus === "REJECTED" && !canResubmit() && (
              <>
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-destructive/10 ring-1 ring-destructive/20">
                  <IconX className="h-10 w-10 text-destructive" />
                </div>
                <div>
                  <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
                    KYC Rejected
                  </h2>
                  <p className="mt-3 text-muted-foreground text-sm leading-relaxed max-w-md mx-auto">
                    Unfortunately, your submission could not be approved.
                  </p>
                </div>
                {kyc?.rejectionReason && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive text-left">
                    <p className="font-medium">Reason:</p>
                    <p className="mt-1 text-xs opacity-90">{kyc.rejectionReason}</p>
                  </div>
                )}
                {kyc?.resubmitAfter && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-600 dark:text-amber-400 flex items-center justify-center gap-2">
                    <IconClock className="h-4 w-4 shrink-0" />
                    You can resubmit after {format(new Date(kyc.resubmitAfter), "PPp")}
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <IconAlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full sm:w-44 justify-between font-normal shrink-0"
                        >
                          <span className="truncate">
                            {selectedCountryCode
                              ? `${selectedCountryCode.flag} ${selectedCountryCode.code} ${selectedCountryCode.country}`
                              : countryCode}
                          </span>
                          <IconChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-64 max-h-72 overflow-y-auto p-0" align="start">
                        <div className="sticky top-0 z-10 bg-popover border-b p-2">
                          <div className="relative">
                            <IconSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
                            <Input
                              value={ccSearch}
                              onChange={(e) => setCcSearch(e.target.value)}
                              onKeyDown={(e) => e.stopPropagation()}
                              placeholder="Search country..."
                              className="h-8 pl-8 text-xs"
                            />
                          </div>
                        </div>
                        <div className="p-1">
                          {filteredCountryCodes.length === 0 && (
                            <p className="px-2 py-3 text-xs text-muted-foreground text-center">
                              No country found
                            </p>
                          )}
                          {filteredCountryCodes.map((cc, idx) => (
                            <DropdownMenuItem
                              key={`${cc.code}-${cc.country}-${idx}`}
                              onSelect={() => {
                                setCountryCode(cc.code);
                                setCcSearch("");
                              }}
                              className="text-sm"
                            >
                              <span className="mr-2">{cc.flag}</span>
                              <span className="font-medium mr-1.5">{cc.code}</span>
                              <span className="text-muted-foreground truncate">
                                {cc.country}
                              </span>
                            </DropdownMenuItem>
                          ))}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <div className="relative flex-1">
                      <IconPhone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        placeholder="Enter phone number"
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 pointer-events-none" />
                    <Input
                      id="email"
                      type="email"
                      value={kyc?.email || user?.email || ""}
                      disabled
                      className="pl-9 opacity-60"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Email is verified from your account
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={gender} onValueChange={setGender}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <div className="flex gap-2">
                      <Select value={dobYear} onValueChange={(v) => setDobPart("y", v)}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent className="max-h-64">
                          {YEARS.map((y) => (
                            <SelectItem key={y} value={y}>{y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={dobMonth} onValueChange={(v) => setDobPart("m", v)}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTHS.map((m) => (
                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={dobDay} onValueChange={(v) => setDobPart("d", v)}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Day" />
                        </SelectTrigger>
                        <SelectContent>
                          {DAYS.map((d) => (
                            <SelectItem key={d} value={d}>{parseInt(d)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {dob && (
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(`${dob}T00:00:00`), "dd MMMM yyyy")}
                      </p>
                    )}
                  </div>
                </div>

                {dob && isUnder18 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <IconAlertTriangle className="h-3 w-3" />
                    You must be 18 years or older to proceed
                  </p>
                )}
                {age !== null && !isUnder18 && dob && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <IconCheck className="h-3 w-3" />
                    Age: {age} years
                  </p>
                )}

                <div className="space-y-2">
                  <Label>Country</Label>
                  <Select
                    value={country}
                    onValueChange={(value) => {
                      setCountry(value);
                      setIdType("");
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="button"
                  onClick={() => {
                    if (!fullName || !phone || !gender || !dob || !country) {
                      setError("Please fill all fields");
                      return;
                    }
                    if (isUnder18) {
                      setError(
                        "You must be 18 years or older to complete KYC verification"
                      );
                      return;
                    }
                    setError("");
                    setStep(2);
                  }}
                  disabled={isUnder18}
                  className="w-full btn-glow btn-glow-hover border-0"
                >
                  Continue
                  <IconArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Step 2: Email OTP */}
            {step === 2 && (
              <div className="space-y-5">
                {!otpSuccess ? (
                  <>
                    {!otpSent ? (
                      <div className="space-y-4">
                        <div className="rounded-lg border p-4">
                          <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand/10 shrink-0">
                              <IconMail className="h-5 w-5 text-brand" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Verify your email</p>
                              <p className="text-xs text-muted-foreground">
                                We&apos;ll send a 6-digit code to your registered email
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={otpLoading}
                          className="w-full btn-glow btn-glow-hover border-0"
                        >
                          {otpLoading ? (
                            <>
                              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending OTP...
                            </>
                          ) : (
                            <>
                              <IconSend className="mr-2 h-4 w-4" />
                              Send OTP to Email
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {otpError && (
                          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                            <IconAlertCircle className="h-3.5 w-3.5 shrink-0" />
                            {otpError}
                          </div>
                        )}
                        <div className="rounded-lg border p-4">
                          <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand/10 shrink-0">
                              <IconMail className="h-5 w-5 text-brand" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">Check your email</p>
                              <p className="text-xs text-muted-foreground">
                                Enter the 6-digit code we sent you
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-center gap-2">
                          {otpDigits.map((digit, i) => (
                            <Input
                              key={i}
                              ref={(el) => {
                                otpRefs.current[i] = el;
                              }}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(i, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(i, e)}
                              onPaste={handleOtpPaste}
                              className="w-10 h-11 sm:w-11 sm:h-12 px-0 text-center text-lg font-semibold"
                            />
                          ))}
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setOtpSent(false);
                              setOtpDigits(["", "", "", "", "", ""]);
                              setOtpError("");
                            }}
                            className="flex-1"
                          >
                            Change Email
                          </Button>
                          <Button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={otpLoading || otpDigits.join("").length !== 6}
                            className="flex-1 btn-glow btn-glow-hover border-0"
                          >
                            {otpLoading ? (
                              <IconLoader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Verify"
                            )}
                          </Button>
                        </div>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={otpLoading}
                          className="w-full text-xs text-brand hover:underline"
                        >
                          Didn&apos;t receive? Resend OTP
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20 mb-3">
                      <IconCheck className="h-8 w-8 text-emerald-500" />
                    </div>
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      Email Verified!
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="sm:w-auto"
                  >
                    <IconArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      if (!otpSuccess) {
                        setError("Please verify your email address");
                        return;
                      }
                      setError("");
                      setStep(3);
                    }}
                    className="flex-1 btn-glow btn-glow-hover border-0"
                  >
                    Continue
                    <IconArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Document Upload */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Government ID Type</Label>
                  <Select value={idType} onValueChange={setIdType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      {getIdTypes().map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Upload Document — Front</Label>
                  <div
                    onDragEnter={(e) => handleDrag(e, "front")}
                    onDragLeave={(e) => handleDrag(e, "front")}
                    onDragOver={(e) => handleDrag(e, "front")}
                    onDrop={(e) => handleDrop(e, "front")}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 cursor-pointer transition-all ${dragActiveFront
                        ? "border-brand bg-brand/5"
                        : documentFile
                          ? "border-emerald-500/50 bg-emerald-500/5"
                          : "border-border hover:border-brand/50 hover:bg-accent/50"
                      }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleFile(e.target.files[0], "front");
                      }}
                    />
                    {documentFile ? (
                      <>
                        {documentPreview ? (
                          <img
                            src={documentPreview}
                            alt="Front Preview"
                            className="max-h-32 rounded-lg object-contain mb-2"
                          />
                        ) : (
                          <IconFile className="h-10 w-10 text-muted-foreground mb-2" />
                        )}
                        <p className="text-sm font-medium text-center break-all px-2">
                          {documentFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {(documentFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDocumentFile(null);
                            setDocumentPreview(null);
                          }}
                          className="mt-2 text-xs text-destructive hover:text-destructive"
                        >
                          Remove
                        </Button>
                      </>
                    ) : (
                      <>
                        <IconUpload className="h-10 w-10 text-muted-foreground/40 mb-2" />
                        <p className="text-sm text-muted-foreground text-center">
                          Drag & drop or{" "}
                          <span className="text-brand font-medium">browse</span>
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          Front side — PNG, JPG, PDF up to 5MB
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Upload Document — Back</Label>
                  <div
                    onDragEnter={(e) => handleDrag(e, "back")}
                    onDragLeave={(e) => handleDrag(e, "back")}
                    onDragOver={(e) => handleDrag(e, "back")}
                    onDrop={(e) => handleDrop(e, "back")}
                    onClick={() => fileInputRefBack.current?.click()}
                    className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 cursor-pointer transition-all ${dragActiveBack
                        ? "border-brand bg-brand/5"
                        : documentFileBack
                          ? "border-emerald-500/50 bg-emerald-500/5"
                          : "border-border hover:border-brand/50 hover:bg-accent/50"
                      }`}
                  >
                    <input
                      ref={fileInputRefBack}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleFile(e.target.files[0], "back");
                      }}
                    />
                    {documentFileBack ? (
                      <>
                        {documentPreviewBack ? (
                          <img
                            src={documentPreviewBack}
                            alt="Back Preview"
                            className="max-h-32 rounded-lg object-contain mb-2"
                          />
                        ) : (
                          <IconFile className="h-10 w-10 text-muted-foreground mb-2" />
                        )}
                        <p className="text-sm font-medium text-center break-all px-2">
                          {documentFileBack.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {(documentFileBack.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDocumentFileBack(null);
                            setDocumentPreviewBack(null);
                          }}
                          className="mt-2 text-xs text-destructive hover:text-destructive"
                        >
                          Remove
                        </Button>
                      </>
                    ) : (
                      <>
                        <IconUpload className="h-10 w-10 text-muted-foreground/40 mb-2" />
                        <p className="text-sm text-muted-foreground text-center">
                          Drag & drop or{" "}
                          <span className="text-brand font-medium">browse</span>
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          Back side — PNG, JPG, PDF up to 5MB
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="sm:w-auto"
                  >
                    <IconArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      if (!idType || !documentFile || !documentFileBack) {
                        setError("Please select ID type and upload both front and back of your government ID");
                        return;
                      }
                      setError("");
                      setStep(4);
                    }}
                    className="flex-1 btn-glow btn-glow-hover border-0"
                  >
                    Continue
                    <IconArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Address Proof */}
            {step === 4 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>Address Proof Type</Label>
                  <Select value={addressProofType} onValueChange={setAddressProofType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ADDRESS_PROOF_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Address Proof — Front</Label>
                  <div
                    onDragEnter={(e) => handleAddressDrag(e, "front")}
                    onDragLeave={(e) => handleAddressDrag(e, "front")}
                    onDragOver={(e) => handleAddressDrag(e, "front")}
                    onDrop={(e) => handleAddressDrop(e, "front")}
                    onClick={() => addrFileInputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 cursor-pointer transition-all ${dragActiveAddrFront
                        ? "border-brand bg-brand/5"
                        : addressFile
                          ? "border-emerald-500/50 bg-emerald-500/5"
                          : "border-border hover:border-brand/50 hover:bg-accent/50"
                      }`}
                  >
                    <input
                      ref={addrFileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleAddressFile(e.target.files[0], "front");
                      }}
                    />
                    {addressFile ? (
                      <>
                        {addressPreview ? (
                          <img src={addressPreview} alt="Front Preview" className="max-h-32 rounded-lg object-contain mb-2" />
                        ) : (
                          <IconFile className="h-10 w-10 text-muted-foreground mb-2" />
                        )}
                        <p className="text-sm font-medium text-center break-all px-2">{addressFile.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{(addressFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        <Button type="button" variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setAddressFile(null); setAddressPreview(null); }} className="mt-2 text-xs text-destructive hover:text-destructive">Remove</Button>
                      </>
                    ) : (
                      <>
                        <IconUpload className="h-10 w-10 text-muted-foreground/40 mb-2" />
                        <p className="text-sm text-muted-foreground text-center">Drag & drop or <span className="text-brand font-medium">browse</span></p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Front side — PNG, JPG, PDF up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Address Proof — Back</Label>
                  <div
                    onDragEnter={(e) => handleAddressDrag(e, "back")}
                    onDragLeave={(e) => handleAddressDrag(e, "back")}
                    onDragOver={(e) => handleAddressDrag(e, "back")}
                    onDrop={(e) => handleAddressDrop(e, "back")}
                    onClick={() => addrFileInputRefBack.current?.click()}
                    className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 cursor-pointer transition-all ${dragActiveAddrBack
                        ? "border-brand bg-brand/5"
                        : addressFileBack
                          ? "border-emerald-500/50 bg-emerald-500/5"
                          : "border-border hover:border-brand/50 hover:bg-accent/50"
                      }`}
                  >
                    <input
                      ref={addrFileInputRefBack}
                      type="file"
                      accept="image/*,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleAddressFile(e.target.files[0], "back");
                      }}
                    />
                    {addressFileBack ? (
                      <>
                        {addressPreviewBack ? (
                          <img src={addressPreviewBack} alt="Back Preview" className="max-h-32 rounded-lg object-contain mb-2" />
                        ) : (
                          <IconFile className="h-10 w-10 text-muted-foreground mb-2" />
                        )}
                        <p className="text-sm font-medium text-center break-all px-2">{addressFileBack.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{(addressFileBack.size / 1024 / 1024).toFixed(2)} MB</p>
                        <Button type="button" variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setAddressFileBack(null); setAddressPreviewBack(null); }} className="mt-2 text-xs text-destructive hover:text-destructive">Remove</Button>
                      </>
                    ) : (
                      <>
                        <IconUpload className="h-10 w-10 text-muted-foreground/40 mb-2" />
                        <p className="text-sm text-muted-foreground text-center">Drag & drop or <span className="text-brand font-medium">browse</span></p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Back side — PNG, JPG, PDF up to 5MB</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep(3)} className="sm:w-auto">
                    <IconArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      if (!addressProofType || !addressFile || !addressFileBack) {
                        setError("Please select document type and upload both front and back of your address proof");
                        return;
                      }
                      setError("");
                      setStep(5);
                    }}
                    className="flex-1 btn-glow btn-glow-hover border-0"
                  >
                    Review
                    <IconArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 5: Review & Submit */}
            {step === 5 && (
              <div className="space-y-5">
                <div className="rounded-lg border p-4 space-y-3">
                  <h3 className="text-sm font-semibold">Personal Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs">Full Name</span>
                      <p className="font-medium">{fullName}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Phone</span>
                      <p className="font-medium">
                        {countryCode} {phone}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Gender</span>
                      <p className="font-medium">{gender}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Date of Birth</span>
                      <p className="font-medium">
                        {dob ? format(new Date(`${dob}T00:00:00`), "dd MMMM yyyy") : "—"} {age !== null && `(${age} years)`}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">Country</span>
                      <p className="font-medium">{country}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground text-xs">ID Type</span>
                      <p className="font-medium">{idType}</p>
                    </div>
                  </div>
                  {documentFile && (
                    <div>
                      <span className="text-muted-foreground text-xs">Document (Front)</span>
                      <p className="font-medium text-sm break-all">
                        {documentFile.name}
                      </p>
                    </div>
                  )}
                  {documentFileBack && (
                    <div>
                      <span className="text-muted-foreground text-xs">Document (Back)</span>
                      <p className="font-medium text-sm break-all">
                        {documentFileBack.name}
                      </p>
                    </div>
                  )}
                </div>

                <div className="rounded-lg border p-4 space-y-3">
                  <h3 className="text-sm font-semibold">Address Proof</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground text-xs">Document Type</span>
                      <p className="font-medium">{addressProofType}</p>
                    </div>
                  </div>
                  {addressFile && (
                    <div>
                      <span className="text-muted-foreground text-xs">Address Proof (Front)</span>
                      <p className="font-medium text-sm break-all">
                        {addressFile.name}
                      </p>
                    </div>
                  )}
                  {addressFileBack && (
                    <div>
                      <span className="text-muted-foreground text-xs">Address Proof (Back)</span>
                      <p className="font-medium text-sm break-all">
                        {addressFileBack.name}
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full btn-glow btn-glow-hover border-0"
                >
                  {loading ? (
                    <>
                      <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <IconShieldCheck className="mr-2 h-4 w-4" />
                      Submit KYC
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(4)}
                  className="w-full"
                >
                  <IconArrowLeft className="mr-2 h-4 w-4" />
                  Back to Edit
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
