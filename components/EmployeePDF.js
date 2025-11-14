"use client";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 20 },
  section: { marginBottom: 10 },
  table: { display: "table", width: "auto", borderStyle: "solid", borderWidth: 1, borderColor: "#bfbfbf" },
  tableRow: { flexDirection: "row" },
  tableCol: { width: "16%", borderStyle: "solid", borderWidth: 1, borderColor: "#bfbfbf", padding: 5 },
  tableCell: { fontSize: 10 },
  header: { fontSize: 16, marginBottom: 10, fontWeight: "bold" },
});

const EmployeeHistoryPDF = ({ employeeDetails, trainingHistory }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Employee Training History</Text>
      <View style={styles.section}>
        <Text>Employee ID: {employeeDetails.EmployeeId}</Text>
        <Text>Name: {employeeDetails.Username}</Text>
        <Text>Department: {employeeDetails.Department}</Text>
        <Text>Section: {employeeDetails.Section}</Text>
        <Text>Designation: {employeeDetails.Designation}</Text>
        <Text>DOJ: {employeeDetails.DOJFormatted}</Text>
        <Text>Status: {employeeDetails.IsActive}</Text>
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
          {["Training Name", "Program Name", "Mode", "Hours", "Date"].map((header) => (
            <View style={styles.tableCol} key={header}>
              <Text style={styles.tableCell}>{header}</Text>
            </View>
          ))}
        </View>
        {trainingHistory.map((item, idx) => (
          <View style={styles.tableRow} key={idx}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{item.Training_Name}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{item.Program_Name}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{item.Train_Mode}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{item.No_Hrs}</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>{item.Training_DateFormatted}</Text>
            </View>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default EmployeeHistoryPDF;
