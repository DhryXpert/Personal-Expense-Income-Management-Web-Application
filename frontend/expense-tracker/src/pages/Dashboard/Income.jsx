import React, { useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import IncomeOverview from "../../components/Income/IncomeOverview";

const Income = () => {

  const [incomeDate, setIncomeDate] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDeleteModel, setOpenDeleteAlert] = useState({
    show : false,
    data:null,
  });

  const [openAddIncomeModel, setOpenAddIncomeModel] = useState(false);

  return (
    <DashboardLayout activeMenu="Income">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 gap-6">
          <div className="">
            <IncomeOverview
              transactions={incomeDate}
              onAddIncome={() => setOpenAddIncomeModel(true)}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Income;
