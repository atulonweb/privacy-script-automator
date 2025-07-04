
import React from 'react';

const PrivacyFeaturesSection: React.FC = () => {
  return (
    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
      <h4 className="font-medium text-blue-900 mb-2">🛡️ Privacy Protection Features</h4>
      <ul className="text-sm text-blue-800 space-y-1">
        <li>• <strong>Script Blocking:</strong> Automatically blocks tracking scripts until consent</li>
        <li>• <strong>Google Analytics Consent Mode v2:</strong> Compliant with latest privacy requirements</li>
        <li>• <strong>Third-party Prevention:</strong> Stops data collection from blocked providers</li>
        <li>• <strong>Consent Persistence:</strong> Remembers user choices across sessions</li>
        <li>• <strong>Settings Management:</strong> Persistent cookie settings button for easy updates</li>
      </ul>
    </div>
  );
};

export default PrivacyFeaturesSection;
