import React, { createContext, useContext, useState } from 'react';
import { ReviewerRole } from '../types/proctoring';

interface ProctorRoleContextType {
  activeRole: ReviewerRole;
  reviewerId: string;
  setActiveRole: (role: ReviewerRole) => void;
  setReviewerId: (id: string) => void;
  isLeadProctor: boolean;
}

const ProctorRoleContext = createContext<ProctorRoleContextType>({
  activeRole: 'lead_proctor',
  reviewerId: 'rev_lead_01',
  setActiveRole: () => {},
  setReviewerId: () => {},
  isLeadProctor: true,
});

export const ProctorRoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRole, setActiveRole] = useState<ReviewerRole>('lead_proctor');
  const [reviewerId, setReviewerId] = useState<string>('rev_lead_01');

  const isLeadProctor = activeRole === 'lead_proctor';

  return (
    <ProctorRoleContext.Provider
      value={{
        activeRole,
        reviewerId,
        setActiveRole,
        setReviewerId,
        isLeadProctor,
      }}
    >
      {children}
    </ProctorRoleContext.Provider>
  );
};

export const useProctorRole = () => useContext(ProctorRoleContext);
