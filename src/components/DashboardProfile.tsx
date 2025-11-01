import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import profileImage from "../assets/ImagePlaceHolder.png";
// import { UserRound } from 'lucide-react';
// import { Lock } from 'lucide-react';
import { authAPI } from "../services/api";
import Swal from "sweetalert2";
import { useAppSelector } from "../hooks/useAppSelector";
// Remove unused import
import { updateUser } from "../store/slices/authSlice";

// Nigerian states with their LGAs
const nigerianLGAs: Record<string, string[]> = {
  Abia: [
    "Aba North",
    "Aba South",
    "Arochukwu",
    "Bende",
    "Ikwuano",
    "Isiala Ngwa North",
    "Isiala Ngwa South",
    "Isuikwuato",
    "Obi Ngwa",
    "Ohafia",
    "Osisioma Ngwa",
    "Ugwunagbo",
    "Ukwa East",
    "Ukwa West",
    "Umuahia North",
    "Umuahia South",
    "Umu Nneochi",
  ],
  Adamawa: [
    "Demsa",
    "Fufure",
    "Ganye",
    "Gayuk",
    "Girei",
    "Gombi",
    "Guyuk",
    "Hong",
    "Jada",
    "Lamurde",
    "Madagali",
    "Maiha",
    "Mayo-Belwa",
    "Michika",
    "Mubi North",
    "Mubi South",
    "Numan",
    "Shelleng",
    "Song",
    "Toungo",
    "Yola North",
    "Yola South",
  ],
  "Akwa Ibom": [
    "Abak",
    "Eastern Obolo",
    "Eket",
    "Esit Eket",
    "Essien Udim",
    "Etim Ekpo",
    "Etinan",
    "Ibeno",
    "Ibesikpo Asutan",
    "Ibiono-Ibom",
    "Ika",
    "Ikono",
    "Ikot Abasi",
    "Ikot Ekpene",
    "Ini",
    "Itu",
    "Mbo",
    "Mkpat-Enin",
    "Nsit-Atai",
    "Nsit-Ibom",
    "Nsit-Ubium",
    "Obot Akara",
    "Okobo",
    "Onna",
    "Oron",
    "Oruk Anam",
    "Udung-Uko",
    "Ukanafun",
    "Uruan",
    "Urue-Offong/Oruko",
    "Uyo",
  ],
  Anambra: [
    "Aguata",
    "Anambra East",
    "Anambra West",
    "Anaocha",
    "Awka North",
    "Awka South",
    "Ayamelum",
    "Dunukofia",
    "Ekwusigo",
    "Idemili North",
    "Idemili South",
    "Ihiala",
    "Njikoka",
    "Nnewi North",
    "Nnewi South",
    "Ogbaru",
    "Onitsha North",
    "Onitsha South",
    "Orumba North",
    "Orumba South",
    "Oyi",
  ],
  Bauchi: [
    "Alkaleri",
    "Bauchi",
    "Bogoro",
    "Damban",
    "Darazo",
    "Dass",
    "Gamawa",
    "Ganjuwa",
    "Giade",
    "Itas/Gadau",
    "Jama'are",
    "Katagum",
    "Kirfi",
    "Misau",
    "Ningi",
    "Shira",
    "Tafawa Balewa",
    "Toro",
    "Warji",
    "Zaki",
  ],
  Bayelsa: [
    "Brass",
    "Ekeremor",
    "Kolokuma/Opokuma",
    "Nembe",
    "Ogbia",
    "Sagbama",
    "Southern Ijaw",
    "Yenagoa",
  ],
  Benue: [
    "Ado",
    "Agatu",
    "Apa",
    "Buruku",
    "Gboko",
    "Guma",
    "Gwer East",
    "Gwer West",
    "Katsina-Ala",
    "Konshisha",
    "Kwande",
    "Logo",
    "Makurdi",
    "Obi",
    "Ogbadibo",
    "Ohimini",
    "Oju",
    "Okpokwu",
    "Oturkpo",
    "Tarka",
    "Ukum",
    "Ushongo",
    "Vandeikya",
  ],
  Borno: [
    "Abadam",
    "Askira/Uba",
    "Bama",
    "Bayo",
    "Biu",
    "Chibok",
    "Damboa",
    "Dikwa",
    "Gubio",
    "Guzamala",
    "Gwoza",
    "Hawul",
    "Jere",
    "Kaga",
    "Kala/Balge",
    "Konduga",
    "Kukawa",
    "Kwaya Kusar",
    "Mafa",
    "Magumeri",
    "Maiduguri",
    "Marte",
    "Mobbar",
    "Monguno",
    "Ngala",
    "Nganzai",
    "Shani",
  ],
  "Cross River": [
    "Abi",
    "Akamkpa",
    "Akpabuyo",
    "Bakassi",
    "Bekwarra",
    "Biase",
    "Boki",
    "Calabar Municipal",
    "Calabar South",
    "Etung",
    "Ikom",
    "Obanliku",
    "Obubra",
    "Obudu",
    "Odukpani",
    "Ogoja",
    "Yakuur",
    "Yala",
  ],
  Delta: [
    "Aniocha North",
    "Aniocha South",
    "Bomadi",
    "Burutu",
    "Ethiope East",
    "Ethiope West",
    "Ika North East",
    "Ika South",
    "Isoko North",
    "Isoko South",
    "Ndokwa East",
    "Ndokwa West",
    "Okpe",
    "Oshimili North",
    "Oshimili South",
    "Patani",
    "Sapele",
    "Udu",
    "Ughelli North",
    "Ughelli South",
    "Ukwuani",
    "Uvwie",
    "Warri North",
    "Warri South",
    "Warri South West",
  ],
  Ebonyi: [
    "Abakaliki",
    "Afikpo North",
    "Afikpo South",
    "Ebonyi",
    "Ezza North",
    "Ezza South",
    "Ikwo",
    "Ishielu",
    "Ivo",
    "Izzi",
    "Ohaozara",
    "Ohaukwu",
    "Onicha",
  ],
  Edo: [
    "Akoko-Edo",
    "Egor",
    "Esan Central",
    "Esan North-East",
    "Esan South-East",
    "Esan West",
    "Etsako Central",
    "Etsako East",
    "Etsako West",
    "Igueben",
    "Ikpoba Okha",
    "Oredo",
    "Orhionmwon",
    "Ovia North-East",
    "Ovia South-West",
    "Owan East",
    "Owan West",
    "Uhunmwonde",
  ],
  Ekiti: [
    "Ado Ekiti",
    "Aiyekire",
    "Efon",
    "Ekiti East",
    "Ekiti South-West",
    "Ekiti West",
    "Emure",
    "Ido Osi",
    "Ijero",
    "Ikere",
    "Ikole",
    "Ilejemeje",
    "Irepodun/Ifelodun",
    "Ise/Orun",
    "Moba",
    "Oye",
  ],
  Enugu: [
    "Aninri",
    "Awgu",
    "Enugu East",
    "Enugu North",
    "Enugu South",
    "Ezeagu",
    "Igbo Etiti",
    "Igbo Eze North",
    "Igbo Eze South",
    "Isi Uzo",
    "Nkanu East",
    "Nkanu West",
    "Nsukka",
    "Oji River",
    "Udenu",
    "Udi",
    "Uzo-Uwani",
  ],
  FCT: [
    "Abuja Municipal Area Council (AMAC)",
    "Abaji",
    "Bwari",
    "Gwagwalada",
    "Kuje",
    "Kwali",
  ],
  Gombe: [
    "Akko",
    "Balanga",
    "Billiri",
    "Dukku",
    "Funakaye",
    "Gombe",
    "Kaltungo",
    "Kwami",
    "Nafada",
    "Shongom",
    "Yamaltu/Deba",
  ],
  Imo: [
    "Aboh Mbaise",
    "Ahiazu Mbaise",
    "Ehime Mbano",
    "Ezinihitte",
    "Ideato North",
    "Ideato South",
    "Ihitte/Uboma",
    "Ikeduru",
    "Isiala Mbano",
    "Isu",
    "Mbaitoli",
    "Ngor Okpala",
    "Njaba",
    "Nkwerre",
    "Nwangele",
    "Obowo",
    "Oguta",
    "Ohaji/Egbema",
    "Okigwe",
    "Onuimo",
    "Orlu",
    "Orsu",
    "Oru East",
    "Oru West",
    "Owerri Municipal",
    "Owerri North",
    "Owerri West",
    "Unuimo",
  ],
  Jigawa: [
    "Auyo",
    "Babura",
    "Biriniwa",
    "Birnin Kudu",
    "Buji",
    "Dutse",
    "Gagarawa",
    "Garki",
    "Gumel",
    "Guri",
    "Gwaram",
    "Gwiwa",
    "Hadejia",
    "Jahun",
    "Kafin Hausa",
    "Kaugama",
    "Kazaure",
    "Kiri Kasama",
    "Kiyawa",
    "Maigatari",
    "Malam Madori",
    "Miga",
    "Ringim",
    "Roni",
    "Sule Tankarkar",
    "Taura",
    "Yankwashi",
  ],
  Kaduna: [
    "Birnin Gwari",
    "Chikun",
    "Giwa",
    "Igabi",
    "Ikara",
    "Jaba",
    "Jema'a",
    "Kachia",
    "Kaduna North",
    "Kaduna South",
    "Kagarko",
    "Kajuru",
    "Kaura",
    "Kauru",
    "Kubau",
    "Kudan",
    "Lere",
    "Makarfi",
    "Sabon Gari",
    "Sanga",
    "Soba",
    "Zangon Kataf",
    "Zaria",
  ],
  Kano: [
    "Ajingi",
    "Albasu",
    "Bagwai",
    "Bebeji",
    "Bichi",
    "Bunkure",
    "Dala",
    "Dambatta",
    "Dawakin Kudu",
    "Dawakin Tofa",
    "Doguwa",
    "Fagge",
    "Gabasawa",
    "Garko",
    "Garun Mallam",
    "Gaya",
    "Gezawa",
    "Gwale",
    "Gwarzo",
    "Kabo",
    "Kano Municipal",
    "Karaye",
    "Kibiya",
    "Kiru",
    "Kumbotso",
    "Kunchi",
    "Kura",
    "Madobi",
    "Makoda",
    "Minjibir",
    "Nasarawa",
    "Rano",
    "Rimin Gado",
    "Rogo",
    "Shanono",
    "Sumaila",
    "Takai",
    "Tarauni",
    "Tofa",
    "Tsanyawa",
    "Tudun Wada",
    "Ungogo",
    "Warawa",
    "Wudil",
  ],
  Katsina: [
    "Bakori",
    "Batagarawa",
    "Batsari",
    "Baure",
    "Bindawa",
    "Charanchi",
    "Dandume",
    "Danja",
    "Dan Musa",
    "Daura",
    "Dutsi",
    "Dutsin Ma",
    "Faskari",
    "Funtua",
    "Ingawa",
    "Jibia",
    "Kafur",
    "Kaita",
    "Kankara",
    "Kankia",
    "Katsina",
    "Kurfi",
    "Kusada",
    "Mai'Adua",
    "Malumfashi",
    "Mani",
    "Mashi",
    "Matazu",
    "Musawa",
    "Rimi",
    "Sabuwa",
    "Safana",
    "Sandamu",
    "Zango",
  ],
  Kebbi: [
    "Aleiro",
    "Arewa Dandi",
    "Argungu",
    "Augie",
    "Bagudo",
    "Birnin Kebbi",
    "Bunza",
    "Dandi",
    "Fakai",
    "Gwandu",
    "Jega",
    "Kalgo",
    "Koko/Besse",
    "Maiyama",
    "Ngaski",
    "Sakaba",
    "Shanga",
    "Suru",
    "Wasagu/Danko",
    "Yauri",
    "Zuru",
  ],
  Kogi: [
    "Adavi",
    "Ajaokuta",
    "Ankpa",
    "Bassa",
    "Dekina",
    "Ibaji",
    "Idah",
    "Igalamela Odolu",
    "Ijumu",
    "Kabba/Bunu",
    "Kogi",
    "Lokoja",
    "Mopa-Muro",
    "Ofu",
    "Ogori/Magongo",
    "Okehi",
    "Okene",
    "Olamaboro",
    "Omala",
    "Yagba East",
    "Yagba West",
  ],
  Kwara: [
    "Asa",
    "Baruten",
    "Edu",
    "Ekiti",
    "Ifelodun",
    "Ilorin East",
    "Ilorin South",
    "Ilorin West",
    "Irepodun",
    "Isin",
    "Kaiama",
    "Moro",
    "Offa",
    "Oke Ero",
    "Oyun",
    "Pategi",
  ],
  Lagos: [
    "Agege",
    "Ajeromi-Ifelodun",
    "Alimosho",
    "Amuwo-Odofin",
    "Apapa",
    "Badagry",
    "Epe",
    "Eti Osa",
    "Ibeju-Lekki",
    "Ifako-Ijaiye",
    "Ikeja",
    "Ikorodu",
    "Kosofe",
    "Lagos Island",
    "Lagos Mainland",
    "Mushin",
    "Ojo",
    "Oshodi-Isolo",
    "Shomolu",
    "Surulere",
  ],
  Nasarawa: [
    "Akwanga",
    "Awe",
    "Doma",
    "Karu",
    "Keana",
    "Keffi",
    "Kokona",
    "Lafia",
    "Nasarawa",
    "Nasarawa Egon",
    "Obi",
    "Toto",
    "Wamba",
  ],
  Niger: [
    "Agaie",
    "Agwara",
    "Bida",
    "Borgu",
    "Bosso",
    "Chanchaga",
    "Edati",
    "Gbako",
    "Gurara",
    "Katcha",
    "Kontagora",
    "Lapai",
    "Lavun",
    "Magama",
    "Mariga",
    "Mashegu",
    "Mokwa",
    "Munya",
    "Paikoro",
    "Rafi",
    "Rijau",
    "Shiroro",
    "Suleja",
    "Tafa",
    "Wushishi",
  ],
  Ogun: [
    "Abeokuta North",
    "Abeokuta South",
    "Ado-Odo/Ota",
    "Egbado North",
    "Egbado South",
    "Ewekoro",
    "Ifo",
    "Ijebu East",
    "Ijebu North",
    "Ijebu North East",
    "Ijebu Ode",
    "Ikenne",
    "Imeko Afon",
    "Ipokia",
    "Obafemi Owode",
    "Odeda",
    "Odogbolu",
    "Ogun Waterside",
    "Remo North",
    "Shagamu",
    "Yewa North",
    "Yewa South",
  ],
  Ondo: [
    "Akoko North-East",
    "Akoko North-West",
    "Akoko South-East",
    "Akoko South-West",
    "Akure North",
    "Akure South",
    "Ese Odo",
    "Idanre",
    "Ifedore",
    "Ilaje",
    "Ile Oluji/Okeigbo",
    "Irele",
    "Odigbo",
    "Okitipupa",
    "Ondo East",
    "Ondo West",
    "Ose",
    "Owo",
  ],
  Osun: [
    "Atakunmosa East",
    "Atakunmosa West",
    "Aiyedaade",
    "Aiyedire",
    "Boluwaduro",
    "Boripe",
    "Ede North",
    "Ede South",
    "Ife Central",
    "Ife East",
    "Ife North",
    "Ife South",
    "Egbedore",
    "Ejigbo",
    "Ifedayo",
    "Ifelodun",
    "Ila",
    "Ilesa East",
    "Ilesa West",
    "Irepodun",
    "Irewole",
    "Isokan",
    "Iwo",
    "Obokun",
    "Odo Otin",
    "Ola Oluwa",
    "Olorunda",
    "Oriade",
    "Orolu",
    "Osogbo",
  ],
  Oyo: [
    "Afijio",
    "Akinyele",
    "Atiba",
    "Atisbo",
    "Egbeda",
    "Ibadan North",
    "Ibadan North-East",
    "Ibadan North-West",
    "Ibadan South-East",
    "Ibadan South-West",
    "Ibarapa Central",
    "Ibarapa East",
    "Ibarapa North",
    "Ido",
    "Irepo",
    "Iseyin",
    "Itesiwaju",
    "Iwajowa",
    "Kajola",
    "Lagelu",
    "Ogbomosho North",
    "Ogbomosho South",
    "Ogo Oluwa",
    "Olorunsogo",
    "Oluyole",
    "Ona Ara",
    "Orelope",
    "Ori Ire",
    "Oyo East",
    "Oyo West",
    "Saki East",
    "Saki West",
    "Surulere",
  ],
  Plateau: [
    "Barkin Ladi",
    "Bassa",
    "Bokkos",
    "Jos East",
    "Jos North",
    "Jos South",
    "Kanam",
    "Kanke",
    "Langtang North",
    "Langtang South",
    "Mangu",
    "Mikang",
    "Pankshin",
    "Qua'an Pan",
    "Riyom",
    "Shendam",
    "Wase",
  ],
  Rivers: [
    "Abua/Odual",
    "Ahoada East",
    "Ahoada West",
    "Akuku-Toru",
    "Andoni",
    "Asari-Toru",
    "Bonny",
    "Degema",
    "Eleme",
    "Emuoha",
    "Etche",
    "Gokana",
    "Ikwerre",
    "Khana",
    "Obio/Akpor",
    "Ogba/Egbema/Ndoni",
    "Ogu/Bolo",
    "Okrika",
    "Omuma",
    "Opobo/Nkoro",
    "Oyigbo",
    "Port Harcourt",
    "Tai",
  ],
  Sokoto: [
    "Binji",
    "Bodinga",
    "Dange Shuni",
    "Gada",
    "Goronyo",
    "Gudu",
    "Gwadabawa",
    "Illela",
    "Isa",
    "Kebbe",
    "Kware",
    "Rabah",
    "Sabon Birni",
    "Shagari",
    "Silame",
    "Sokoto North",
    "Sokoto South",
    "Tambuwal",
    "Tangaza",
    "Tureta",
    "Wamako",
    "Wurno",
    "Yabo",
  ],
  Taraba: [
    "Ardo Kola",
    "Bali",
    "Donga",
    "Gashaka",
    "Gassol",
    "Ibi",
    "Jalingo",
    "Karim Lamido",
    "Kumi",
    "Lau",
    "Sardauna",
    "Takum",
    "Ussa",
    "Wukari",
    "Yorro",
    "Zing",
  ],
  Yobe: [
    "Bade",
    "Bursari",
    "Damaturu",
    "Geidam",
    "Gujba",
    "Gulani",
    "Jakusko",
    "Karasuwa",
    "Machina",
    "Nangere",
    "Nguru",
    "Potiskum",
    "Tarmuwa",
    "Yunusari",
    "Yusufari",
  ],
  Zamfara: [
    "Anka",
    "Bakura",
    "Birnin Magaji/Kiyaw",
    "Bukkuyum",
    "Bungudu",
    "Gummi",
    "Gusau",
    "Kaura Namoda",
    "Maradun",
    "Maru",
    "Shinkafi",
    "Talata Mafara",
    "Tsafe",
    "Zurmi",
  ],
};

const nigerianStates = Object.keys(nigerianLGAs);

export const DashboardProfile: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  // Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // 2FA state

  const [isLoading2FA, setIsLoading2FA] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState<string[]>(
    Array(6).fill("")
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>(Array(6).fill(null));
  const { user } = useAppSelector((state) => state.auth);
  const [is2FAEnabled, setIs2FAEnabled] = useState(user.emailAuth);
  const dispatch = useDispatch();

  // Initialize input refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  // Handle 2FA toggle
  const handle2FAToggle = async () => {
    try {
      setIsLoading2FA(true);
      if (!is2FAEnabled) {
        // Enable 2FA - show verification modal
        const response = await authAPI.twoFASetup(user?._id || "");
        if (response.status) {
          setShowVerificationModal(true);
        }
      } else {
        // Disable 2FA directly
        await handleDisable2FA();
      }
    } catch (error) {
      console.error("Error toggling 2FA:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update 2FA settings. Please try again.",
      });
    } finally {
      setIsLoading2FA(false);
    }
  };

  // Handle disable 2FA
  const handleDisable2FA = async () => {
    try {
      const response = await authAPI.twofactorVerify({
        userId: user?._id,
        code: "000000", // Special code to disable 2FA
        disable: true,
      });

      if (response.status) {
        setIs2FAEnabled(false);
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 3000);
      }
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      throw error;
    }
  };

  // Handle verification code input
  const handleCodeInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value.replace(/\D/g, ""); // Only allow numbers
    if (value === "" || /^\d$/.test(value)) {
      const newCode = [...verificationCode];
      newCode[index] = value;
      setVerificationCode(newCode);

      // Move to next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle verify code submission
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = verificationCode.join("");
    if (code.length !== 6) return;

    try {
      setIsVerifying(true);
      const response = await authAPI.twofactorVerify({
        userId: user?._id,
        otp: code,
        // disable: false,
      });

      if (response.status) {
        setIs2FAEnabled(true);
        setShowVerificationModal(false);
        setShowSuccessModal(true);
        setVerificationCode(Array(6).fill(""));
        setTimeout(() => setShowSuccessModal(false), 3000);
      }
    } catch (error) {
      console.error("Verification failed:", error);
      Swal.fire({
        icon: "error",
        title: "Verification Failed",
        text: "The verification code is invalid or has expired. Please try again.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Cancel verification
  const cancelVerification = () => {
    setShowVerificationModal(false);
    setVerificationCode(Array(6).fill(""));
    setIsLoading2FA(false);
  };

  // Password validation
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword !== "";
  const isPasswordValid =
    hasMinLength && hasUppercase && hasNumber && passwordsMatch;

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) return;

    try {
      setIsUpdatingPassword(true);
      // Call your API to update password
      const response = await authAPI.updatePassword({
        oldPassword,
        newPassword,
        confirmPassword,
      });

      // Clear form on success
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Show success message
      if (response.status === true) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Password updated successfully",
          timer: 3000,
          showConfirmButton: false,
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to update password",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // const handleOldPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setOldPassword(e.target.value);
  // };

  // const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setNewPassword(e.target.value);
  // };

  // const handleConfirmPasswordChange = (
  //   e: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   setConfirmPassword(e.target.value);
  // };

  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [showLGADropdown, setShowLGADropdown] = useState(false);
  const [stateSearch, setStateSearch] = useState("");
  const [lgaSearch, setLgaSearch] = useState("");
  const [availableLGAs, setAvailableLGAs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialFormData, setInitialFormData] = useState({
    residentialAddress: "",
    phoneNumber: "",
    emailAddress: "",
    profilePhoto: "",
    scoutingRole: "",
    scoutDivision: "",
    scoutDistrict: "",
    troop: "",
  });
  const [formData, setFormData] = useState({
    firstName: user?.fullName.split(" ")[0],
    lastName: user?.fullName.split(" ")[1],
    dateOfBirth: user?.dateOfBirth,
    gender: user?.gender,
    stateOfOrigin: user?.stateOfOrigin,
    localGovArea: user?.lga,
    residentialAddress: user?.address,
    phoneNumber: user?.phoneNumber,
    emailAddress: user?.email,
    memberId: user?.membershipId,
    stateScoutCouncil: user?.stateScoutCouncil,
    scoutingRole: user?.scoutingRole,
    role: user?.role,
    scoutDivision: user?.scoutDivision,
    scoutDistrict: user?.scoutDistrict,
    profilePhoto: user?.profilePic,
    troop: user?.troop,
    section: user?.section,
  });

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".dropdown-container")) {
        setShowStateDropdown(false);
        setShowLGADropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredStates = nigerianStates.filter((state) =>
    state.toLowerCase().includes(stateSearch.toLowerCase())
  );
  const filteredLGAs = availableLGAs.filter((lga: string) =>
    lga.toLowerCase().includes(lgaSearch.toLowerCase())
  );

  const handleStateSelect = (state: string) => {
    setFormData((prev) => ({
      ...prev,
      stateOfOrigin: state,
      localGovArea: "", // Reset LGA when state changes
    }));
    setShowStateDropdown(false);
    setStateSearch("");
    setLgaSearch("");
    setAvailableLGAs(nigerianLGAs[state] || []);
  };

  const handleLGASelect = (lga: string) => {
    setFormData((prev) => ({
      ...prev,
      localGovArea: lga,
    }));
    setLgaSearch(lga);
    setShowLGADropdown(false);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      // Check differences against the initial snapshot using the NEXT state
      const tracked = [
        "residentialAddress",
        "phoneNumber",
        "emailAddress",
        "profilePhoto",
        "scoutingRole",
        "scoutDivision",
        "scoutDistrict",
        "troop",
      ] as const;
      const isChanged = tracked.some((k) => next[k] !== initialFormData[k]);
      setHasChanges(isChanged);
      return next;
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await authAPI.updateUserProfile({
        // id: user?._id,
        scoutingRole: formData.scoutingRole,
        // fullName: formData.firstName + " " + formData.lastName,
        phoneNumber: formData.phoneNumber,
        address: formData.residentialAddress,
        // email: formData.emailAddress,
        profilePic: formData.profilePhoto,
        // stateOfOrigin: formData.stateOfOrigin,
        // localGovArea: formData.localGovArea,
        scoutDivision: formData.scoutDivision,
        scoutDistrict: formData.scoutDistrict,
        troop: formData.troop,
      });

      if (response.status === true) {
        // Update Redux user slice with the latest profile fields
        dispatch(
          updateUser({
            address: formData.residentialAddress,
            phoneNumber: formData.phoneNumber,
            email: formData.emailAddress,
            profilePic: formData.profilePhoto,
            scoutingRole: formData.scoutingRole,
            scoutDivision: formData.scoutDivision,
            scoutDistrict: formData.scoutDistrict,
            troop: formData.troop,
          })
        );

        setHasChanges(false);

        // Show success message
        Swal.fire({
          icon: "success",
          title: "Profile updated",
          text: "Your profile has been updated successfully!",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error instanceof Error
            ? error.message
            : "Failed to update profile. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update initial form data when user data is loaded
  useEffect(() => {
    if (user) {
      setInitialFormData({
        residentialAddress: user.address || "",
        phoneNumber: user.phoneNumber || "",
        emailAddress: user.email || "",
        profilePhoto: user.profilePic || "",
        scoutingRole: user.scoutingRole || "",
        scoutDivision: user.scoutDivision || "",
        scoutDistrict: user.scoutDistrict || "",
        troop: user.troop || "",
      });
    }
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto">
      <div>
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900">My Account</h1>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-2 px-1 border-b-2 font-medium text-sm w-fit flex items-center gap-2 ${
                activeTab === "profile"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {/* <span className="mr-2"><UserRound /></span> */}
              Profile
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`py-2 px-1 border-b-2 font-medium text-sm w-fit flex items-center gap-2 ${
                activeTab === "security"
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {/* <span className="mr-2"><Lock /></span> */}
              Security
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "profile" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">Profile</h2>
                <button
                  className={`px-4 py-2 rounded-md text-white ${
                    hasChanges
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                  onClick={handleSave}
                  disabled={!hasChanges || loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ">
                {/* Personal Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-base font-medium text-gray-900 mb-4">
                    Edit Personal Information
                  </h3>

                  {/* Profile Photo */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-20 h-20 bg-green-600 rounded-full flex items-center justify-center overflow-hidden">
                        <img
                          src={formData.profilePhoto || profileImage}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                        <label
                          htmlFor="profile-photo"
                          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                          title="Click to change photo"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                        </label>
                        <input
                          id="profile-photo"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const base64String = reader.result as string;
                                handleInputChange("profilePhoto", base64String);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          JPG, GIF or PNG. Max 2MB
                        </p>
                        <button
                          onClick={() =>
                            document.getElementById("profile-photo")?.click()
                          }
                          className="text-green-600 hover:text-green-700 font-medium text-sm mt-1"
                        >
                          Update photo
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          First name
                        </label>
                        <input
                          type="text"
                          value={formData.firstName}
                          readOnly
                          className="w-full px-3 bg-gray-100 py-2 border border-gray-200 rounded-lg cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Last name
                        </label>
                        <input
                          type="text"
                          value={formData.lastName}
                          readOnly
                          className="w-full px-3 bg-gray-100 py-2 border border-gray-200 rounded-lg cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Date of birth
                        </label>
                        <input
                          type="date"
                          value={
                            formData.dateOfBirth
                              ? new Date(formData.dateOfBirth)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          readOnly
                          className="w-full px-3 bg-gray-100 py-2 border border-gray-200 rounded-lg cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Gender
                        </label>
                        <select
                          value={formData.gender}
                          disabled
                          className="w-full px-3 bg-gray-100 py-2 border border-gray-200 rounded-lg cursor-not-allowed"
                        >
                          <option>Female</option>
                          <option>Male</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <div className="dropdown-container">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State of origin
                          </label>
                          <input
                            type="text"
                            value={formData.stateOfOrigin}
                            readOnly
                            placeholder="State of origin"
                            className="w-full px-3 bg-gray-100 py-2 border border-gray-200 rounded-lg cursor-not-allowed"
                          />
                          {showStateDropdown && (
                            <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                              <div className="p-2">
                                <input
                                  type="text"
                                  placeholder="Search"
                                  value={stateSearch}
                                  // onChange={(e) => setStateSearch(e.target.value)}
                                  className="w-full bg-gray-200 px-2 py-1 text-sm border border-gray-200 rounded"
                                />
                              </div>
                              {filteredStates.map((state) => (
                                <div
                                  key={state}
                                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStateSelect(state);
                                  }}
                                >
                                  {state}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="dropdown-container">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Local Government Area
                        </label>
                        <input
                          type="text"
                          value={formData.localGovArea}
                          readOnly
                          className="w-full px-3 bg-gray-100 py-2 border border-gray-200 rounded-lg cursor-not-allowed"
                          placeholder="Local Government Area"
                        />
                        {showLGADropdown &&
                          formData.stateOfOrigin !== "Select state" && (
                            <div className="absolute z-10 mt-1 w-[200px] bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                              <div className="p-2">
                                <input
                                  type="text"
                                  placeholder="Search LGA"
                                  value={lgaSearch}
                                  onChange={(e) => setLgaSearch(e.target.value)}
                                  className="w-[200px] px-2 py-1 text-sm border border-gray-200 rounded-lg"
                                />
                              </div>
                              {filteredLGAs.map((lga) => (
                                <div
                                  key={lga}
                                  className="w-[200px] text-left px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleLGASelect(lga);
                                  }}
                                >
                                  {lga}
                                </div>
                              ))}
                            </div>
                          )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Residential address
                      </label>
                      <input
                        type="text"
                        value={formData.residentialAddress}
                        onChange={(e) =>
                          handleInputChange(
                            "residentialAddress",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone number
                      </label>
                      <input
                        type="text"
                        value={formData.phoneNumber}
                        // inputMode="numeric"
                        // pattern="[0-9]{11}"
                        title="Enter an 11-digit phone number using numbers only"
                        maxLength={11}
                        minLength={11}
                        onChange={(e) => {
                          const digits = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 11);
                          handleInputChange("phoneNumber", digits);
                        }}
                        onKeyDown={(e) => {
                          if (["e", "E", "+", "-", "."].includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onPaste={(e) => {
                          e.preventDefault();
                          const text = e.clipboardData?.getData("text") || "";
                          const digits = text.replace(/\D/g, "").slice(0, 11);
                          handleInputChange("phoneNumber", digits);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email address
                      </label>
                      <input
                        type="email"
                        value={formData.emailAddress}
                        // onChange={(e) => handleInputChange("emailAddress", e.target.value)}
                        readOnly
                        className="w-full px-3 bg-gray-100 py-2 border border-gray-200 rounded-lg cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Scout Information */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-base font-medium text-gray-900 mb-4">
                    Edit Scout Information
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Member ID
                      </label>
                      <div className="flex">
                        <span className="bg-[#CFDFCD] text-green-800 px-3 py-1.5 rounded-[20px] text-sm font-medium">
                          {formData.memberId}
                        </span>
                        {/* <input
                          type="text"
                          disabled
                          className="flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50"
                        /> */}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Scouting Role
                      </label>
                      <input
                        type="text"
                        value={formData.scoutingRole}
                        // readOnly
                        onChange={(e) =>
                          handleInputChange("scoutingRole", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Section
                      </label>
                      <input
                        type="text"
                        value={formData.section}
                        readOnly
                        // onChange={(e) =>
                        //   handleInputChange("scoutingRole", e.target.value)
                        // }
                        className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-lg cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State Scout Council
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.stateScoutCouncil}
                          readOnly
                          // onChange={(e) =>
                          //   handleInputChange(
                          //     "stateScoutCouncil",
                          //     e.target.value
                          //   )
                          // }
                          className="w-full px-3 py-2 border border-gray-300 bg-gray-100 rounded-lg cursor-not-allowed"
                        />
                        {/* <input
                          type="text"
                          value={formData.scoutDivision}
                          readOnly
                          className="w-full px-3 bg-gray-100 py-2 border border-gray-200 rounded-md cursor-not-allowed"
                        /> */}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Scout Division
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.scoutDivision}
                          onChange={(e) =>
                            handleInputChange("scoutDivision", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                        {/* <input
                          type="text"
                          value={formData.scoutDivision}
                          readOnly
                          className="w-full px-3 bg-gray-100 py-2 border border-gray-200 rounded-md cursor-not-allowed"
                        /> */}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Scout District
                      </label>
                      <input
                        type="text"
                        value={formData.scoutDistrict}
                        // readOnly
                        onChange={(e) =>
                          handleInputChange("scoutDistrict", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Troop
                      </label>
                      <input
                        type="text"
                        value={formData.troop}
                        // readOnly
                        onChange={(e) =>
                          handleInputChange("troop", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-6">
                Security
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 ">
                {/* Password Section */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-base font-medium text-gray-900 mb-4">
                    Set a new password
                  </h3>

                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current password
                      </label>
                      <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm new password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div className="text-sm text-gray-600">
                      <p className="mb-2">Your password should have</p>
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <div
                            className={`w-4 h-4 rounded-full border-2 ${
                              hasMinLength
                                ? "bg-green-500 border-green-500"
                                : "border-gray-300"
                            } mr-2 flex items-center justify-center`}
                          >
                            {hasMinLength && (
                              <span className="text-white text-xs">✓</span>
                            )}
                          </div>
                          Min. 8 characters
                        </div>
                        <div className="flex items-center">
                          <div
                            className={`w-4 h-4 rounded-full border-2 ${
                              hasUppercase && hasNumber
                                ? "bg-green-500 border-green-500"
                                : "border-gray-300"
                            } mr-2 flex items-center justify-center`}
                          >
                            {hasUppercase && hasNumber && (
                              <span className="text-white text-xs">✓</span>
                            )}
                          </div>
                          An uppercase and a number
                        </div>
                        <div className="flex items-center">
                          <div
                            className={`w-4 h-4 rounded-full border-2 ${
                              passwordsMatch
                                ? "bg-green-500 border-green-500"
                                : "border-gray-300"
                            } mr-2 flex items-center justify-center`}
                          >
                            {passwordsMatch && (
                              <span className="text-white text-xs">✓</span>
                            )}
                          </div>
                          Passwords match
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={!isPasswordValid || isUpdatingPassword}
                      className={`px-4 py-2 rounded-md text-white ${
                        isPasswordValid
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-gray-300 cursor-not-allowed"
                      }`}
                    >
                      {isUpdatingPassword ? "Updating..." : "Update Password"}
                    </button>
                  </form>
                </div>

                {/* 2FA Section */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-base font-medium text-gray-900 mb-4">
                    2FA Authenticator
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          Enable Two-Factor Authentication (2FA)
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          Two-factor authentication adds an extra layer of
                          security to your account. When enabled, you'll need to
                          enter a verification code from your authenticator app
                          when signing in.
                        </div>
                      </div>
                      <div className="ml-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={is2FAEnabled}
                            onChange={handle2FAToggle}
                            disabled={isLoading2FA}
                          />
                          <div
                            className={`w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-green-300 ${
                              is2FAEnabled ? "bg-green-600" : ""
                            } peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`}
                          >
                            {isLoading2FA && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            )}
                          </div>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2FA Verification Modal */}
          {showVerificationModal && (
            <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <p className="text-gray-600 mb-6">
                  Enter the 6-digit verification code sent to your email.
                </p>
                <form onSubmit={handleVerifyCode}>
                  <div className="flex justify-between mb-6">
                    {verificationCode.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => {
                          if (el) inputRefs.current[index] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeInput(e, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        className="w-12 h-12 text-2xl text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={cancelVerification}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      disabled={isVerifying}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                        isVerifying ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                      disabled={
                        isVerifying || verificationCode.some((d) => d === "")
                      }
                    >
                      {isVerifying ? "Verifying..." : "Verify"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Success Modal */}
          {showSuccessModal && (
            <div className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Success!</h2>
                <p className="text-gray-600 mb-6">
                  {is2FAEnabled
                    ? "Two-factor authentication has been enabled successfully."
                    : "Two-factor authentication has been disabled."}
                </p>
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mx-auto"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardProfile;
