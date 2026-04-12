const calculateOtPay = (employee, schedules) => {
    const otRate = Number(employee.otRate) || 100;
    // Fix: Use 'employee_id' to match Sequelize's foreign key field in the Schedule model.
    // 'employee.id' is the primary key (UUID) of the employee.
    const otCount = schedules.filter(s => 
        s.employee_id === employee.id && (s.shift === 'OT1' || s.shift === 'OT2')
    ).length;
    return otCount * otRate;
};

const calculateSocialSecurity = (salary) => {
    return Math.min(salary * 0.05, 750); // Max 750 THB
};

module.exports = {
    calculateOtPay,
    calculateSocialSecurity
};
