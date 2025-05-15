
import React from 'react';
import { CheckIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const SuccessAlert: React.FC = () => {
  return (
    <Alert className="bg-green-50 border-green-200 mb-4">
      <CheckIcon className="h-4 w-4 text-green-600" />
      <AlertTitle className="text-green-800">Success!</AlertTitle>
      <AlertDescription className="text-green-700">
        Your script has been successfully created and is ready to use. You can always find all your scripts in the Scripts page.
      </AlertDescription>
    </Alert>
  );
};

export default SuccessAlert;
