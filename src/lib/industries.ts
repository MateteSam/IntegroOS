/**
 * Comprehensive list of industries for business categorization
 */

export const industries = [
  // Technology & Software
  'Software Development',
  'Information Technology',
  'Cybersecurity',
  'Artificial Intelligence',
  'Data Analytics',
  'Cloud Computing',
  'Mobile App Development',
  'Web Development',
  'SaaS (Software as a Service)',
  'E-commerce Platform',
  'Fintech',
  'EdTech',
  'HealthTech',
  'PropTech',
  'Gaming',
  'Blockchain & Cryptocurrency',
  
  // Healthcare & Medical
  'Healthcare Services',
  'Medical Devices',
  'Pharmaceuticals',
  'Biotechnology',
  'Telemedicine',
  'Mental Health Services',
  'Dental Services',
  'Veterinary Services',
  'Medical Research',
  'Health Insurance',
  'Wellness & Fitness',
  'Nutrition & Supplements',
  
  // Finance & Banking
  'Banking',
  'Investment Services',
  'Insurance',
  'Real Estate',
  'Mortgage Services',
  'Financial Planning',
  'Accounting Services',
  'Tax Services',
  'Credit Services',
  'Payment Processing',
  'Wealth Management',
  'Cryptocurrency Exchange',
  
  // Retail & E-commerce
  'E-commerce',
  'Retail Store',
  'Fashion & Apparel',
  'Beauty & Cosmetics',
  'Jewelry',
  'Home & Garden',
  'Electronics',
  'Sports & Outdoors',
  'Automotive Parts',
  'Books & Media',
  'Toys & Games',
  'Pet Supplies',
  'Grocery & Food',
  
  // Professional Services
  'Consulting',
  'Legal Services',
  'Marketing & Advertising',
  'Public Relations',
  'Human Resources',
  'Business Coaching',
  'Event Planning',
  'Photography',
  'Graphic Design',
  'Web Design',
  'Content Creation',
  'Translation Services',
  'Virtual Assistant',
  
  // Manufacturing & Industrial
  'Manufacturing',
  'Automotive',
  'Aerospace',
  'Construction',
  'Architecture',
  'Engineering',
  'Mining',
  'Oil & Gas',
  'Renewable Energy',
  'Utilities',
  'Logistics & Supply Chain',
  'Packaging',
  
  // Food & Beverage
  'Restaurant',
  'Food Delivery',
  'Catering',
  'Food Manufacturing',
  'Beverage Production',
  'Coffee Shop',
  'Bar & Nightclub',
  'Food Truck',
  'Bakery',
  'Organic Food',
  'Specialty Foods',
  
  // Education & Training
  'Education Services',
  'Online Learning',
  'Corporate Training',
  'Language Learning',
  'Skill Development',
  'Tutoring',
  'Childcare',
  'University',
  'Vocational Training',
  'Educational Technology',
  
  // Entertainment & Media
  'Entertainment',
  'Media Production',
  'Music Industry',
  'Film & Video',
  'Publishing',
  'Broadcasting',
  'Social Media',
  'Influencer Marketing',
  'Event Management',
  'Sports & Recreation',
  'Travel & Tourism',
  
  // Transportation & Logistics
  'Transportation',
  'Shipping & Logistics',
  'Ride Sharing',
  'Delivery Services',
  'Moving Services',
  'Car Rental',
  'Aviation',
  'Maritime',
  'Public Transportation',
  
  // Agriculture & Environment
  'Agriculture',
  'Farming',
  'Forestry',
  'Environmental Services',
  'Waste Management',
  'Recycling',
  'Sustainability Consulting',
  'Green Technology',
  
  // Non-Profit & Government
  'Non-Profit Organization',
  'Government Services',
  'Social Services',
  'Religious Organization',
  'Charity',
  'Community Services',
  'Political Organization',
  
  // Network Marketing & MLM
  'Network Marketing',
  'Multi-Level Marketing (MLM)',
  'Direct Sales',
  'Affiliate Marketing',
  'Health & Wellness MLM',
  'Beauty & Skincare MLM',
  'Financial Services MLM',
  'Travel MLM',
  'Technology MLM',
  'Home Products MLM',
  'Nutrition MLM',
  'Essential Oils MLM',
  
  // Other
  'Other',
  'Startup',
  'Freelancing',
  'Personal Brand',
  'Influencer',
  'Content Creator'
];

/**
 * Get industries grouped by category
 */
export const getIndustriesByCategory = () => {
  return {
    'Technology & Software': industries.slice(0, 16),
    'Healthcare & Medical': industries.slice(16, 28),
    'Finance & Banking': industries.slice(28, 40),
    'Retail & E-commerce': industries.slice(40, 53),
    'Professional Services': industries.slice(53, 66),
    'Manufacturing & Industrial': industries.slice(66, 78),
    'Food & Beverage': industries.slice(78, 89),
    'Education & Training': industries.slice(89, 99),
    'Entertainment & Media': industries.slice(99, 110),
    'Transportation & Logistics': industries.slice(110, 119),
    'Agriculture & Environment': industries.slice(119, 127),
    'Non-Profit & Government': industries.slice(127, 134),
    'Network Marketing & MLM': industries.slice(134, 146),
    'Other': industries.slice(146)
  };
};

/**
 * Search industries by keyword
 */
export const searchIndustries = (keyword: string): string[] => {
  if (!keyword.trim()) return industries;
  
  const searchTerm = keyword.toLowerCase();
  return industries.filter(industry => 
    industry.toLowerCase().includes(searchTerm)
  );
};

export default industries;