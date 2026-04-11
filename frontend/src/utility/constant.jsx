import { FaWhatsapp, FaLinkedin } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import axios from "axios";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css"; // Ensure you import styles
const LOCATION_SERVER_URL = import.meta.env.VITE_LOCATION_FETCHING_SERVER_URL;
const LOCATION_API = import.meta.env.VITE_LOCATION_FETCHING_API_KEY;
// export const SERVER_URL = import.meta.env.VITE_SERVER_URL;
export const months = [
  {
    id: 1,
    name: "January",
    value: "01",
    number: 1,
    alphabetics: "Jan",
  },
  {
    id: 2,
    name: "February",
    value: "02",
    number: 2,
    alphabetics: "Feb",
  },
  {
    id: 3,
    name: "March",
    value: "03",
    number: 3,
    alphabetics: "Mar",
  },
  {
    id: 4,
    name: "April",
    value: "04",
    number: 4,
    alphabetics: "Apr",
  },
  {
    id: 5,
    name: "May",
    value: "05",
    number: 5,
    alphabetics: "May",
  },
  {
    id: 6,
    name: "June",
    value: "06",
    number: 6,
    alphabetics: "Jun",
  },
  {
    id: 7,
    name: "July",
    value: "07",
    number: 7,
    alphabetics: "Jul",
  },
  {
    id: 8,
    name: "August",
    value: "08",
    number: 8,
    alphabetics: "Aug",
  },
  {
    id: 9,
    name: "September",
    value: "09",
    number: 9,
    alphabetics: "Sep",
  },
  {
    id: 10,
    name: "October",
    value: "10",
    number: 10,
    alphabetics: "Oct",
  },
  {
    id: 11,
    name: "November",
    value: "11",
    number: 11,
    alphabetics: "Nov",
  },
  {
    id: 12,
    name: "December",
    value: "12",
    number: 12,
    alphabetics: "Dec",
  },
];
export const initialProductDetails = {
  name: "",
  category: "",
  subCategory: "",
  description: "",
  stock: "",
  brand: "",
  mrpPrice: "",
  sellingPrice: "",
};
export const orderStatus = [
  "order placed",
  "order confirmed",
  "processing",
  "shipped",
  "out for delivery",
  "delivered",
  "cancelled",
];
export const initialSellerDetails = {
  businessName: "",
  panNumber: "",
  gstNumber: "",
  phoneNumber: "",
  emailAddress: "",
  businessAddress: "",
  city: "",
  State: "",
  PinCode: "",
  coutry: "",
  businessType: "",
  websiteUrl: "",
  companyRegistrationNumber: "",
  tradeLicenseNumber: "",
  bankAccountNumber: "",
  bankName: "",
  ifscCode: "",
  socialMediaLinks: "",
};

export const guestUser = {
  email: "guest@gmail.com",
  password: "guestuser",
};
export const sellerUser = {
  email: "seller@gmail.com",
  password: "seller123",
};
export const adminUser = {
  email: "admin@gmail.com",
  password: "adminuser",
};

export const sellerRegistrationInputFields = [
  {
    id: 1,
    name: "businessName", // camelCase
    label: "Business Name",
    type: "text",
    placeholder: "Enter business name",
    required: true,
    tab: "businessInformation",
    validationRule: (value) =>
      !value?.trim() ? "Business Name is required" : null,
  },
  {
    id: 2,
    name: "panNumber", // camelCase
    label: "PAN Number",
    type: "text",
    placeholder: "Enter PAN number",
    required: true,
    tab: "legalInformation",
    maxLength: 10,
    validationRule: (value) => {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
      if (!value?.trim()) {
        return "PAN Number is required";
      }
      if (!panRegex.test(value)) {
        return "Invalid PAN Number format";
      }
      return null;
    },
  },
  {
    id: 3,
    name: "gstNumber", // camelCase
    label: "GST Number",
    type: "text",
    placeholder: "Enter GST number",
    required: true,
    tab: "legalInformation",
    maxLength: 15,
    validationRule: (value) => {
      const gstRegex =
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/;
      if (!value?.trim()) {
        return "GST Number is required";
      }
      if (!gstRegex.test(value)) {
        return "Invalid GST Number format";
      }
      return null;
    },
  },
  {
    id: 4,
    name: "phoneNumber", // camelCase
    label: "Phone Number",
    type: "tel",
    placeholder: "Enter phone number",
    tab: "businessInformation",
    required: true,
    validationRule: (value) =>
      !value?.trim() ? "Phone Number is required" : null,
  },
  {
    id: 5,
    name: "emailAddress", // camelCase
    label: "Email Address",
    type: "email",
    placeholder: "Enter email address",
    tab: "businessInformation",
    required: true,
    validationRule: (value) =>
      !value?.trim() ? "Email Address is required" : null,
  },
  {
    id: 6,
    name: "addressLine1", // camelCase
    label: "Address Line 1",
    type: "text",
    placeholder: "Enter business address",
    required: true,
    tab: "businessInformation",
    validationRule: (value) =>
      !value?.trim() ? " Address Line 1 is required" : null,
  },
  {
    id: 7,
    name: "city", // camelCase
    label: "City",
    type: "text",
    placeholder: "Enter City name",
    tab: "businessInformation",
    required: true,
    validationRule: (value) => (!value?.trim() ? "City is required" : null),
  },
  {
    id: 8,
    name: "state", // camelCase
    label: "State",
    type: "text",
    placeholder: "Enter State Name",
    tab: "businessInformation",
    required: true,
    validationRule: (value) => (!value?.trim() ? "State is required" : null),
  },
  {
    id: 9,
    name: "pinCode", // camelCase
    label: "Pin Code",
    type: "text",
    placeholder: "Enter Pin Code",
    tab: "businessInformation",
    required: true,
    validationRule: (value) => (!value?.trim() ? "Pin Code is required" : null),
  },
  {
    id: 10,
    name: "country", // camelCase
    label: "Country",
    type: "text",
    placeholder: "Enter Country Name",
    tab: "businessInformation",
    required: true,
    validationRule: (value) => (!value?.trim() ? "Country is required" : null),
  },
  {
    id: 11,
    name: "businessType", // camelCase
    label: "Business Type",
    type: "text",
    placeholder: "Enter business type",
    required: true,
    tab: "businessInformation",
    validationRule: (value) =>
      !value?.trim() ? "Business Type is required" : null,
  },
  {
    id: 13,
    name: "websiteUrl", // camelCase
    label: "Website URL",
    type: "url",
    placeholder: "Enter website URL",
    tab: "businessInformation",
    validationRule: (value) =>
      value
        ? !/^https?:\/\/.+\..+/.test(value)
          ? "Enter a valid Website URL"
          : null
        : null,
  },
  {
    id: 15,
    name: "companyRegistrationNumber", // camelCase
    label: "Company Registration Number",
    type: "text",
    placeholder: "Enter company registration number",
    tab: "legalInformation",
    validationRule: (value) =>
      value && !value.trim() ? "Company Registration Number is required" : null,
  },
  {
    id: 16,
    name: "tradeLicenseNumber", // camelCase
    label: "Trade License Number",
    type: "text",
    placeholder: "Enter trade license number",
    tab: "legalInformation",
    validationRule: (value) =>
      value && !value.trim() ? "Trade License Number is required" : null,
  },
  {
    id: 17,
    name: "bankAccountNumber", // camelCase
    label: "Bank Account Number",
    type: "text",
    placeholder: "Enter bank account number",
    required: true,
    tab: "financialInformation",
    validationRule: (value) =>
      !value?.trim() ? "Bank Account Number is required" : null,
  },
  {
    id: 18,
    name: "bankName", // camelCase
    label: "Bank Name",
    type: "text",
    placeholder: "Enter bank name",
    required: true,
    tab: "financialInformation",
    validationRule: (value) =>
      !value?.trim() ? "Bank Name is required" : null,
  },
  {
    id: 19,
    name: "ifscCode", // camelCase
    label: "IFSC Code",
    type: "text",
    placeholder: "Enter IFSC code",
    required: true,
    tab: "financialInformation",
    validationRule: (value) =>
      !value?.trim() ? "IFSC Code is required" : null,
  },
  {
    id: 20,
    name: "socialMediaLinks", // camelCase
    label: "Social Media Links",
    type: "text",
    placeholder: "Enter social media links (comma-separated)",
    validationRule: (value) =>
      value && value.trim() && !/^[\w\s,]+$/.test(value)
        ? "Enter valid comma-separated links"
        : null,
  },
];

export const socialMedia = [
  {
    name: "Whatsapp",
    link: "https://wa.me/?text=",
    icon: (
      <FaWhatsapp className="text-3xl p-1 text-blue-400 rounded-full hover:bg-blue-400 hover:text-white" />
    ),
  },
  // {
  //   name: "Facebook",
  //   link: "https://www.facebook.com/sharer/sharer.php?u=",
  //   icon: <FaFacebook />,
  // },
  {
    name: "LinkedIn",
    link: "https://www.linkedin.com/messaging/compose?message=",
    icon: (
      <FaLinkedin className="text-3xl p-1 text-blue-400 rounded-full hover:bg-blue-400 hover:text-white" />
    ),
  },
  {
    name: "Email",
    link: "mailto:?body=",
    icon: (
      <MdEmail className="text-3xl p-1 text-blue-400 rounded-full hover:bg-blue-400 hover:text-white" />
    ),
  },
];

export const productCategory = [
  {
    id: 1,
    name: "category",
    value: "electronics",
    child: ["Smartphones", "laptops", "cameras", "headphones", "gadgets"],
  },
  {
    id: 2,
    name: "category",
    value: "clothing",
    child: ["shirts", "pants", "t-shirts", "jeans", "dresses"],
  },
  {
    id: 3,
    name: "category",
    value: "home & kitchen",
    child: [
      "Cookware",
      "appliances",
      "furniture",
      "kitchenware",
      "household items",
    ],
  },
  {
    id: 4,
    name: "cateory",
    value: "books",
    child: ["fiction", "non-fiction", "children's books", "mystery", "romance"],
  },
  {
    id: 5,
    name: "category",
    value: "grocery",
    child: [
      "vegetables",
      "fruits",
      "meat",
      "dairy",
      "bakery",
      "snacks",
      "beverages",
    ],
  },
  {
    id: 6,
    name: "category",
    value: "toys",
    child: [
      "action figures",
      "electronic toys",
      "building toys",
      "sports toys",
      "diy toys",
    ],
  },
  {
    id: 7,
    name: "category",
    value: "sports",
    child: ["football", "basketball", "tennis", "hockey", "golf"],
  },
  {
    id: 8,
    name: "category",
    value: "health & beauty",
    child: [
      "makeup",
      "skincare",
      "hair care",
      "beauty supplies",
      "personal care",
      "fragrances",
      "Health Care",
    ],
  },
  {
    id: 9,
    name: "category",
    value: "fashion",
    child: ["shoes", "accessories", "jewelry"],
  },
  {
    id: "10",
    name: "category",
    value: "others",
  },
];

export const productBrands = [
  { id: 1, name: "Apple", value: "apple" },
  { id: 2, name: "Nike", value: "nike" },
  { id: 3, name: "Samsung", value: "samsung" },
  { id: 4, name: "Adidas", value: "adidas" },
  { id: 5, name: "Sony", value: "sony" },
  { id: 6, name: "Microsoft", value: "microsoft" },
  { id: 7, name: "Gucci", value: "gucci" },
  { id: 8, name: "LG", value: "lg" },
  { id: 9, name: "Rolex", value: "rolex" },
  { id: 10, name: "Puma", value: "puma" },
  { id: 11, name: "Reebok", value: "reebok" },
  { id: 12, name: "Vans", value: "vans" },
  { id: 13, name: "H&M", value: "hm" },
  { id: 14, name: "Zara", value: "zara" },
  { id: 15, name: "Versace", value: "versace" },
  { id: 16, name: "Chanel", value: "chanel" },
  { id: 17, name: "Gucci", value: "gucci" },
  { id: 18, name: "Dior", value: "dior" },
  { id: 19, name: "Prada", value: "prada" },
  { id: 20, name: "Burberry", value: "burberry" },
  { id: 21, name: "Boat", value: "boat" },
  { id: 22, name: "Others", value: "others" },
];

export const formatNumber = (amount, icon = "₹") => {
  const amountString = amount?.toString();
  return amount
    ? icon + amountString?.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    : amount;
};

// Generating Dynamic future Years
export const generateFutureYearsForExpiryDate = () => {
  const currentYear = new Date().getFullYear();
  const futureYears = [];
  for (let i = currentYear; i <= currentYear + 20; i++) {
    futureYears.push(i.toString());
  }
  return futureYears;
};

export const getAllCountry = async () => {
  try {
    const response = await axios({
      method: "GET",
      url: `${LOCATION_SERVER_URL}/countries`,
      headers: {
        "X-CSCAPI-KEY": LOCATION_API,
      },
    });

    if (response.status === 200) {
      const countryNames = response.data?.map((data) => ({
        id: data?.id,
        name: data?.name,
        emoji: data?.emoji,
        phoneCode: data?.phonecode,
        iso2: data?.iso2,
        iso3: data?.iso3,
      }));

      return countryNames; // Directly return the processed data
    }
  } catch (error) {
    console.error("Error fetching countries:", error);
    return []; // Return an empty array or handle error appropriately
  }
};

export const swalWithCustomConfiguration = {
  fire: (...args) => {
    const resolvedTheme =
      typeof window !== "undefined"
        ? localStorage.getItem("theme") || "light"
        : "light";
    const isDark = resolvedTheme === "dark";

    const incomingOptions =
      typeof args?.[0] === "object" && args?.[0] !== null
        ? args?.[0]
        : {
            title: args?.[0],
            text: args?.[1],
            icon: args?.[2],
          };

    const incomingDidOpen = incomingOptions?.didOpen;

    return Swal.fire({
      ...incomingOptions,
      background: isDark ? "#1f2937" : "#ffffff",
      color: isDark ? "#f9fafb" : "#111827",
      customClass: {
        popup: isDark
          ? "bg-gray-800 text-white border border-gray-700 rounded-xl"
          : "bg-white text-gray-900 border border-gray-200 rounded-xl",
        title: isDark ? "text-white" : "text-gray-900",
        htmlContainer: isDark ? "text-gray-300" : "text-gray-700",
        denyButton: "bg-gray-300 text-white",
        confirmButton: "confirm-btn",
        ...(incomingOptions?.customClass || {}),
      },
      didOpen: (popup) => {
        const closeEl = popup.querySelector(".swal2-close");
        if (closeEl) {
          closeEl.style.color = isDark ? "#d1d5db" : "#374151";
        }

        if (typeof incomingDidOpen === "function") {
          incomingDidOpen(popup);
        }
      },
    });
  },
};

export const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

export const customToast = (theme) => {
  const resolvedTheme =
    theme ||
    (typeof window !== "undefined"
      ? localStorage.getItem("theme") || "light"
      : "light");
  const isDark = resolvedTheme === "dark";

  return Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
    background: isDark ? "#1f2937" : "#ffffff",
    color: isDark ? "#f9fafb" : "#111827",
    didOpen: (toast) => {
      const baseClasses = [
        "rounded-lg",
        "shadow-lg",
        "p-3",
        "font-medium",
        "text-sm",
        "transition-all",
        "duration-300",
        "border",
      ];

      const darkClasses = ["bg-gray-800", "text-white", "border-gray-700"];
      const lightClasses = ["bg-white", "text-gray-900", "border-gray-200"];

      toast.classList.add(
        ...baseClasses,
        ...(isDark ? darkClasses : lightClasses),
      );

      // SweetAlert sets internal title/content colors; force theme-aligned text colors.
      const titleEl = toast.querySelector(".swal2-title");
      const contentEl = toast.querySelector(".swal2-html-container");
      const closeEl = toast.querySelector(".swal2-close");

      if (titleEl) {
        titleEl.style.color = isDark ? "#f9fafb" : "#111827";
      }

      if (contentEl) {
        contentEl.style.color = isDark ? "#e5e7eb" : "#1f2937";
      }

      if (closeEl) {
        closeEl.style.color = isDark ? "#d1d5db" : "#374151";
      }

      // Style progress bar
      const progressBar = toast.querySelector(".swal2-progress-bar");
      if (progressBar) {
        progressBar.style.backgroundColor = isDark ? "#2563EB" : "#3B82F6";
        progressBar.style.borderRadius = "0 0 0.5rem 0.5rem";
      }

      // Pause timer on hover
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });
};

// export const customToast = (theme) => {
//   return Swal.mixin({
//     toast: true,
//     position: "top-end",
//     showConfirmButton: false,
//     timer: 2000,
//     timerProgressBar: true,
//     didOpen: (toast) => {
//       // Apply Tailwind classes manually
//       toast.classList.add("rounded-lg", "shadow-lg", "p-3", "font-medium");
//       if (theme === "dark") {
//         toast.classList.add("bg-gray-800", "text-white");
//       } else {
//         toast.classList.add("bg-white", "text-gray-900");
//       }

//       // Apply styles to the progress bar
//       const progressBar = toast.querySelector(".swal2-progress-bar");
//       if (progressBar) {
//         progressBar.style.backgroundColor =
//           theme === "dark" ? "#2563EB" : "#3B82F6"; // Equivalent to Tailwind blue-600/blue-400
//       }

//       // Pause timer on hover
//       toast.onmouseenter = Swal.stopTimer;
//       toast.onmouseleave = Swal.resumeTimer;
//     },
//   });
// };

export const paymentMethods = [
  {
    id: "debitcard",
    value: "debitcard",
    label: "Debit / Credit Card",
    classes: "debitcreditcard min-w-[60px] mobile:col-span-1",
  },
  {
    id: "upi",
    value: "upi",
    label: "UPI",
    classes: "upi min-w-[70px] mobile:col-span-1",
  },
  {
    id: "cod",
    value: "cod",
    label: "Cash On Delivery",
    classes:
      "cod min-w-[60px] mobile:col-span-2 small-device:col-span-1 tablet:col-span-2 laptop:col-span-2 desktop:col-span-1",
  },
];
export const addressInputField = [
  {
    label: "Address Line 1",
    type: "text",
    placeholder: "Address Line 1",
    value: "addressLine1",
    name: "addressLine1",
    id: "addressLine1",
    required: true,
  },
  {
    label: "Address Line 2",
    type: "text",
    placeholder: "Address Line 2",
    value: "adressLine2",
    name: "adressLine2",
    id: "addressLine2",
    required: false,
  },
  {
    label: "Country",
    type: "text",
    placeholder: "Country",
    value: "country",
    name: "country",
    id: "country",
    required: true,
  },
  {
    label: "State",
    type: "text",
    placeholder: "State",
    value: "state",
    name: "state",
    id: "state",
    required: true,
  },
  {
    label: "City",
    type: "text",
    placeholder: "City",
    value: "city",
    name: "city",
    id: "city",
    required: true,
  },
  {
    label: "PinCode",
    type: "text",
    placeholder: "PinCode",
    value: "pinCode",
    name: "pinCode",
    id: "PinCode",
    required: true,
  },
];

// export const customToast = (theme) => {
//   console.log(theme);
//   return Swal.mixin({
//     toast: true,
//     position: "top-end",
//     showConfirmButton: false,
//     timer: 2000,
//     timerProgressBar: true,
//     customClass: {
//       popup:
//         theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900",
//       title: theme === "dark" ? "text-white" : "text-gray-900",
//       timerProgressBar: theme === "dark" ? "bg-blue-600" : "bg-blue-400",
//     },
//     didOpen: (toast) => {
//       toast.onmouseenter = Swal.stopTimer;
//       toast.onmouseleave = Swal.resumeTimer;
//     },
//   });
// };

export const swalCustomConfiguration = (theme) => {
  return Swal.mixin({
    customClass: {
      popup:
        theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900",
      title: theme === "dark" ? "text-white" : "text-gray-900",
      htmlContainer: theme === "dark" ? "text-gray-300" : "text-gray-700",
      confirmButton:
        theme === "dark"
          ? "bg-blue-600 text-white hover:bg-blue-500"
          : "bg-blue-500 text-white hover:bg-blue-400",
      denyButton:
        theme === "dark"
          ? "bg-gray-600 text-white hover:bg-gray-500"
          : "bg-gray-300 text-gray-900 hover:bg-gray-200",
      cancelButton:
        theme === "dark"
          ? "bg-red-600 text-white hover:bg-red-500"
          : "bg-red-500 text-white hover:bg-red-400",
    },
    buttonsStyling: false, // Disable default styling to apply Tailwind classes
  });
};

// export const swalWithCustomConfiguration = (theme) => {
//   return Swal.mixin({
//     customClass: {
//       popup: theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900",
//       title: theme === "dark" ? "text-white" : "text-gray-900",
//       htmlContainer: theme === "dark" ? "text-gray-300" : "text-gray-700",
//       confirmButton: theme === "dark"
//         ? "bg-blue-600 text-white hover:bg-blue-500"
//         : "bg-blue-500 text-white hover:bg-blue-400",
//       denyButton: theme === "dark"
//         ? "bg-gray-600 text-white hover:bg-gray-500"
//         : "bg-gray-300 text-gray-900 hover:bg-gray-200",
//       cancelButton: theme === "dark"
//         ? "bg-red-600 text-white hover:bg-red-500"
//         : "bg-red-500 text-white hover:bg-red-400",
//     },
//     buttonsStyling: false, // Disable default styling to apply Tailwind classes
//   });
// };

export const toCapitalizeCase = (str) => {
  if (!str) return null;
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export const checkValidation = (data = {}, requireData) => {
  const errors = {};
  const requiredKeys =
    Array.isArray(requireData) && requireData?.length > 0
      ? requireData
      : Object.keys(data);

  if (requiredKeys.length < 1) return null;
  // console.log(Object.entries(data));
  Object.entries(data).forEach(([key, value]) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isRequired = requiredKeys.includes(key);
    if (isRequired) {
      if (
        value === undefined ||
        value === null ||
        value?.toString()?.trim() === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        errors[key] = `${toCapitalizeCase(key)} is required!`;
        return;
      }

      if (key.toLowerCase() === "email" && typeof value === "string") {
        if (!emailRegex.test(value)) {
          errors[key] = `Invalid email format`;
        }
      }
      if (key.toLowerCase() === "password" && value.length < 6) {
        errors[key] = `Password must be minimun six charactors`;
      }
    }
  });
  return Object.keys(errors).length > 0 ? errors : false;
};
