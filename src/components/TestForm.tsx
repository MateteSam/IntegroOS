import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormInput, FormTextarea } from "@/components/ui/form-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { IndustryButtonSelect } from "@/components/ui/industry-button-select";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useAnalytics } from "@/hooks/useAnalytics";

interface TestFormData {
  name: string;
  email: string;
  company: string;
  industry: string;
  budget: string;
  description: string;
  website: string;
}

/**
 * TestForm component to demonstrate all input functionality
 */
const TestForm: React.FC = () => {
  const { trackFormSubmit } = useAnalytics();

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    isValid,
    isDirty
  } = useFormValidation<TestFormData>(
    {
      name: '',
      email: '',
      company: '',
      industry: '',
      budget: '',
      description: '',
      website: ''
    },
    {
      name: { required: true, minLength: 2 },
      email: { required: true, email: true },
      company: { required: true, minLength: 2 },
      industry: { required: true },
      budget: { required: true },
      description: { required: true, minLength: 10, maxLength: 500 },
      website: { url: true }
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateAll()) {
      console.log('Form submitted:', values);
      trackFormSubmit('test-form', { 
        industry: values.industry,
        budget: values.budget 
      });
      
      // Here you would typically send the data to your API
      alert('Form submitted successfully!');
      reset();
    }
  };

  // Industries are now imported from the comprehensive list

  const budgetRanges = [
    '$1,000 - $5,000',
    '$5,000 - $10,000',
    '$10,000 - $25,000',
    '$25,000 - $50,000',
    '$50,000+'
  ];

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="bg-black/40 border-white/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white text-2xl">Business Information Form</CardTitle>
          <p className="text-gray-400">
            Test form to demonstrate all input functionality with validation
          </p>
          {isDirty && (
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 w-fit">
              Form has unsaved changes
            </Badge>
          )}
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Text Inputs */}
            <div className="grid md:grid-cols-2 gap-4">
              <FormInput
                label="Full Name"
                placeholder="Enter your full name"
                value={values.name}
                onChange={(e) => handleChange('name', e.target.value)}
                onBlur={() => handleBlur('name')}
                error={errors.name}
                required
              />
              
              <FormInput
                label="Email Address"
                type="email"
                placeholder="your@email.com"
                value={values.email}
                onChange={(e) => handleChange('email', e.target.value)}
                onBlur={() => handleBlur('email')}
                error={errors.email}
                required
              />
            </div>

            <FormInput
              label="Company Name"
              placeholder="Your company name"
              value={values.company}
              onChange={(e) => handleChange('company', e.target.value)}
              onBlur={() => handleBlur('company')}
              error={errors.company}
              hint="Enter the name of your business or organization"
              required
            />

            {/* Select Dropdowns */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-white text-sm font-medium block">
                  Industry <span className="text-red-400 ml-1">*</span>
                </label>
                <IndustryButtonSelect
                  value={values.industry}
                  onValueChange={(value) => handleChange('industry', value)}
                  placeholder="Click to select your industry"
                  className={errors.industry ? "border-red-400" : ""}
                  industries={[
                    "Technology",
                    "Software Development",
                    "Information Technology",
                    "Artificial Intelligence",
                    "E-commerce",
                    "SaaS (Software as a Service)",
                    "Healthcare Services",
                    "Medical Devices",
                    "Telemedicine",
                    "Banking",
                    "Fintech",
                    "Investment Services",
                    "Real Estate",
                    "Retail Store",
                    "Fashion & Apparel",
                    "Beauty & Cosmetics",
                    "Consulting",
                    "Marketing & Advertising",
                    "Legal Services",
                    "Manufacturing",
                    "Automotive",
                    "Construction",
                    "Restaurant",
                    "Food Delivery",
                    "Education Services",
                    "Online Learning",
                    "Entertainment",
                    "Media Production",
                    "Transportation",
                    "Logistics & Supply Chain",
                    "Network Marketing",
                    "Multi-Level Marketing (MLM)",
                    "Direct Sales",
                    "Health & Wellness MLM",
                    "Beauty & Skincare MLM",
                    "Nutrition MLM",
                    "Other"
                  ]}
                />
                {errors.industry && (
                  <p className="text-red-400 text-xs flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.industry}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-white text-sm font-medium block">
                  Marketing Budget <span className="text-red-400 ml-1">*</span>
                </label>
                <Select 
                  value={values.budget} 
                  onValueChange={(value) => handleChange('budget', value)}
                >
                  <SelectTrigger className={errors.budget ? "border-red-400" : ""}>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetRanges.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.budget && (
                  <p className="text-red-400 text-xs flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {errors.budget}
                  </p>
                )}
              </div>
            </div>

            {/* URL Input */}
            <FormInput
              label="Website URL"
              type="url"
              placeholder="https://yourwebsite.com"
              value={values.website}
              onChange={(e) => handleChange('website', e.target.value)}
              onBlur={() => handleBlur('website')}
              error={errors.website}
              hint="Optional: Enter your website URL"
            />

            {/* Textarea */}
            <FormTextarea
              label="Business Description"
              placeholder="Tell us about your business, goals, and challenges..."
              value={values.description}
              onChange={(e) => handleChange('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              error={errors.description}
              hint={`${values.description.length}/500 characters`}
              rows={4}
              required
            />

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={reset}
                disabled={!isDirty}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Reset Form
              </Button>
              
              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-white hover:bg-white/10"
                >
                  Save Draft
                </Button>
                <Button
                  type="submit"
                  disabled={!isValid || !isDirty}
                  className="bg-gradient-to-r from-blue-500 to-purple-600"
                >
                  Submit Form
                </Button>
              </div>
            </div>

            {/* Form Status */}
            <div className="text-center text-sm">
              {isValid ? (
                <p className="text-green-400">✓ All fields are valid</p>
              ) : (
                <p className="text-yellow-400">⚠ Please fix the errors above</p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestForm;