
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ExistingScriptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ExistingScriptDialog: React.FC<ExistingScriptDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const navigate = useNavigate();
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Script Already Exists</AlertDialogTitle>
          <AlertDialogDescription>
            This website already has one or more consent scripts. Do you want to create another one or view existing scripts?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>Continue Creating</AlertDialogCancel>
          <AlertDialogAction onClick={() => navigate('/dashboard/scripts')}>View Existing Scripts</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ExistingScriptDialog;
