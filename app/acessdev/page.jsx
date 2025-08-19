"use client";
import { useState, useEffect } from "react";

export default function ApiListPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedEmployeeId = localStorage.getItem("employeeId");

    if (!storedEmployeeId) {
      window.location.href = "/";
      return;
    }

    if (storedEmployeeId === "250010") {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }

    setLoading(false);
  }, []);

  if (loading) return <div className="text-center mt-10 text-lg">Loading...</div>;

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <h1 className="text-2xl font-bold text-red-600">
          ❌ Unauthorized Access
        </h1>
      </div>
    );
  }

  const sections = [
    {
      title: "I. Training Calendar / annualtraining",
      items: ["get_annual_training_calendar", "get_access_role"],
    },
    {
      title: "I. Training Calendar / requirement",
      items: [
        "view_training_data_by_employee",
        "insert_trainingdata",
        "view_training_data_by_employee",
        "get_programs_dropdown",
        "get_access_role",
        "delete_training_data_requirement",
        "update_training_data_requirement",
      ],
    },
    {
      title: "I. Training Calendar / approvalform",
      items: [
        "page.jsx ->",
        "approval_form_data",
        "get_access_role",
        "update_approval_form",
        "update_status_approval",
        "monthcount.jsx",
        "approval_form_month_count",
      ],
    },
    {
      title: "I. Training Calendar / approveddata",
      items: ["view_approval_form_submit_data", "approval_form_data_view_batch"],
    },
    {
      title: "II. Transactions - Training Attendance entry",
      items: [
        "user_dropdown",
        "qualified_trainer_dropdown",
        "get_training_att_entry",
        "get_venue_dropdown",
        "get_training_attendance_dropdown",
        "get_access_role",
        "get_tet_form_emp_details",
        "update_trainingdata_att_entry_submit",
        "insert_emp_att_program_wise",
        "get_tet_form_emp_details",
        "get_tet_form_emp_details_for_report",
      ],
    },
    {
      title: "II. Transactions - Monthly Training Particulars",
      items: ["get_access_role", "get_monthly_particulars"],
    },
    {
      title: "III. TET Training Effectiveness - Generate TEE Forms /tetformsgenerate",
      items: [
        "get_access_role",
        "get_tet_form_data",
        "get_tet_form_user_dropdown_res_person_update_tl",
      ],
    },
    {
      title: "III. TET Training Effectiveness /tetreports",
      items: [
        "post_tet_form_review",
        "get_access_role",
        "get_tet_form_emp_details_for_report",
        "get_tet_form_emp_details",
        "get_tet_form_program_name",
        "get_tet_form_emp_details_for_report",
        "get_tet_form_user_dropdown_by_res_person",
        "get_tet_form_emp_details_for_report_empid",
      ],
    },
    {
      title: "III. TET Training Effectiveness - Generic Forms /tetformsgeneric",
      items: [
        "get_access_role",
        "get_tet_form_user_dropdown_by_generic",
        "get_tet_form_data_generic",
      ],
    },
    {
      title: "III. TET Training Effectiveness /tetreportsgeneric",
      items: [
        "post_tet_form_review",
        "get_access_role",
        "get_tet_form_emp_details_for_report",
        "get_tet_form_emp_details",
        "get_tet_form_program_name",
        "get_tet_form_emp_details_for_report",
        "get_tet_form_user_dropdown_by_generic",
        "get_tet_form_emp_details_for_report_empid",
      ],
    },
    {
      title: "III. Reports /ratingdistribution",
      items: [
        "get_rating_distribution",
        "get_program_name_dropdown",
        "get_rating_counts",
        "get_program_details",
        "ratingdistribution/barchart",
        "get_rating_counts",
      ],
    },
    {
      title: "IV. (trainmaterials) /uploadmaterials",
      items: [
        "get_training_att_entry_certificates",
        "upload_certificates_dropdown",
        "upload_files",
        "insert_upload_materials_status",
        "view_upload_materials",
        "get_access_role",
      ],
    },
    {
      title: "IV. (trainingcert) /uploadcer",
      items: [
        "get_access_role",
        "get_training_att_entry_certificates",
        "upload_certificates_dropdown",
        "upload_certificates",
        "view_upload_certificates",
      ],
    },
    {
      title: "V. T&D Report /emphistory",
      items: [
        "insert_upload_emp_certificate_status",
        "get_emp_history",
        "get_employee_history_table",
        "user_dropdown",
        "get_access_role",
      ],
    },
    {
      title: "V. T&D Report /quatrainlist",
      items: [
        "get_access_role",
        "user_qualified_dropdown_testing",
        "view_qualifier_list",
        "get_user_details",
        "insert_qualified_trainer_list",
        "generate_email_qualified_trainers_submit",
        "trainer_approval_form_data",
        "update_active_status_to_remove_trainers",
        "approvalformfortrainers",
        "trainer_approval_form_data",
        "emailfortrainers",
        "generate_rejection_email_for_trainers",
        "generate_email_qualified_trainers",
        "generate_email_qualified_trainers_submit",
      ],
    },
    {
      title: "V. T&D Report /traincost",
      items: [
        "check_finalisation_status",
        "get_access_role",
        "get_training_budget_first",
        "get_training_budget",
        "insert_additional_budget",
        "save_training_note",
        "finalise_additional_budget",
      ],
    },
    {
      title: "V. (trainingagencies) /uploadexternal",
      items: ["insert_agencies", "get_agencies"],
    },
    {
      title: "V. /trainingrecord",
      items: [
        "get_access_role",
        "standard_program_add",
        "Update TL",
        "tetformgeneratefortl",
        "get_access_role",
        "get_tet_form_data_res_person",
        "tetreportsfortl",
        "get_tet_form_user_dropdown_res_person_update_tl",
        "get_tet_form_program_name",
        "update_tl_dropdown",
        "update_res_person",
      ],
    },
    {
      title: "V. headcount",
      items: [
        "get_access_role",
        "get_data_by_department_dropdown_head_count",
        "get_data_by_overall_summary_head_Count",
        "get_data_by_department_head_count",
      ],
    },
    {
      title: "V. totrainhrs",
      items: [
        "get_access_role",
        "get_data_by_dept_wise_mnthsVShrs",
        "get_data_by_desg_wise_mnthsVShrs",
        "get_data_by_program_wise_mnthsVShrs",
        "get_data_by_dept_wise_mnthsVShrs",
      ],
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">
        📋 API Endpoints List
      </h1>
      <div className="space-y-4">
        {sections.map((section, index) => (
          <Accordion key={index} title={section.title} items={section.items} />
        ))}
      </div>
    </div>
  );
}

function Accordion({ title, items }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border rounded-lg shadow-sm bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-4 py-3 font-semibold text-gray-800 hover:bg-blue-50"
      >
        {title}
        <span>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <ul className="px-6 py-2 list-disc text-gray-700">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
