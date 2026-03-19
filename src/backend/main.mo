import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Extend with authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile type as required by the frontend
  public type UserProfile = {
    name : Text;
    employeeId : ?Nat;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized");
    };
    userProfiles.add(caller, profile);
  };

  public type Institute = {
    id : Nat;
    name : Text;
    code : Text;
    location : Text;
  };

  let institutes = Map.empty<Nat, Institute>();

  module Institute {
    public func compare(a : Institute, b : Institute) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  public type Designation = {
    #professor;
    #lecturer;
    #scientist;
    #officer;
    #researchEngineer;
    #adminStaff;
    #humanResources;
  };

  public type EmploymentType = {
    #regular;
    #temporary;
  };

  public type Employee = {
    id : Nat;
    name : Text;
    employeeId : Text;
    instituteId : Nat;
    designation : Designation;
    employmentType : EmploymentType;
    joiningDate : Text;
    address : Text;
    dob : Text;
    basicSalary : Nat;
  };

  let employees = Map.empty<Nat, Employee>();
  let principalToEmployeeId = Map.empty<Principal, Nat>();

  module Employee {
    public func compare(a : Employee, b : Employee) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  var nextInstituteId = 1;
  var nextEmployeeId = 1;

  // ─── Institute CRUD ───────────────────────────────────────────────────────────

  public shared ({ caller }) func addInstitute(name : Text, code : Text, location : Text) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    let id = nextInstituteId;
    nextInstituteId += 1;
    institutes.add(id, { id; name; code; location });
    id;
  };

  public query ({ caller }) func getInstitute(id : Nat) : async Institute {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) Runtime.trap("Unauthorized");
    switch (institutes.get(id)) {
      case null Runtime.trap("Not found");
      case (?v) v;
    };
  };

  public query ({ caller }) func getAllInstitutes() : async [Institute] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) Runtime.trap("Unauthorized");
    institutes.values().toArray().sort();
  };

  public shared ({ caller }) func updateInstitute(id : Nat, name : Text, code : Text, location : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    switch (institutes.get(id)) {
      case null Runtime.trap("Not found");
      case (?_) institutes.add(id, { id; name; code; location });
    };
  };

  public shared ({ caller }) func deleteInstitute(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    switch (institutes.get(id)) {
      case null Runtime.trap("Not found");
      case (?_) institutes.remove(id);
    };
  };

  // ─── Employee CRUD ────────────────────────────────────────────────────────────

  public shared ({ caller }) func addEmployee(
    name : Text, employeeId : Text, instituteId : Nat,
    designation : Designation, employmentType : EmploymentType,
    joiningDate : Text, address : Text, dob : Text, basicSalary : Nat
  ) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    let id = nextEmployeeId;
    nextEmployeeId += 1;
    employees.add(id, { id; name; employeeId; instituteId; designation; employmentType; joiningDate; address; dob; basicSalary });
    id;
  };

  public shared ({ caller }) func linkEmployeeToPrincipal(employeeId : Nat, principal : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    switch (employees.get(employeeId)) {
      case null Runtime.trap("Not found");
      case (?_) principalToEmployeeId.add(principal, employeeId);
    };
  };

  public query ({ caller }) func getEmployee(id : Nat) : async Employee {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) Runtime.trap("Unauthorized");
    if (AccessControl.isAdmin(accessControlState, caller)) {
      switch (employees.get(id)) {
        case null Runtime.trap("Not found");
        case (?e) e;
      };
    } else {
      switch (principalToEmployeeId.get(caller)) {
        case null Runtime.trap("Not linked");
        case (?eid) {
          if (eid != id) Runtime.trap("Unauthorized");
          switch (employees.get(id)) {
            case null Runtime.trap("Not found");
            case (?e) e;
          };
        };
      };
    };
  };

  public query ({ caller }) func getMyEmployeeData() : async ?Employee {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) Runtime.trap("Unauthorized");
    switch (principalToEmployeeId.get(caller)) {
      case null null;
      case (?eid) employees.get(eid);
    };
  };

  public query ({ caller }) func getAllEmployeesForInstitute(instituteId : Nat) : async [Employee] {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    let lst = List.empty<Employee>();
    for ((_, e) in employees.entries()) {
      if (e.instituteId == instituteId) lst.add(e);
    };
    lst.toArray().sort();
  };

  public query ({ caller }) func getEmployementForInstituteWithDesignation(instituteId : Nat, designation : Designation) : async [Employee] {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    let lst = List.empty<Employee>();
    for ((_, e) in employees.entries()) {
      if (e.instituteId == instituteId and e.designation == designation) lst.add(e);
    };
    lst.toArray().sort();
  };

  public query ({ caller }) func getAllEmployees() : async [Employee] {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    employees.values().toArray().sort();
  };

  public shared ({ caller }) func updateEmployee(
    id : Nat, name : Text, employeeId : Text, instituteId : Nat,
    designation : Designation, employmentType : EmploymentType,
    joiningDate : Text, address : Text, dob : Text, basicSalary : Nat
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    switch (employees.get(id)) {
      case null Runtime.trap("Not found");
      case (?_) employees.add(id, { id; name; employeeId; instituteId; designation; employmentType; joiningDate; address; dob; basicSalary });
    };
  };

  public shared ({ caller }) func deleteEmployee(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    switch (employees.get(id)) {
      case null Runtime.trap("Not found");
      case (?_) {
        employees.remove(id);
        for ((p, eid) in principalToEmployeeId.entries()) {
          if (eid == id) principalToEmployeeId.remove(p);
        };
      };
    };
  };

  // ─── Attendance ───────────────────────────────────────────────────────────────

  public type AttendanceRecord = {
    employeeId : Nat;
    month : Nat;
    year : Nat;
    days : [Text];
    totalPresent : Nat;
    totalAbsent : Nat;
    isLocked : Bool;
  };

  let attendanceRecords = Map.empty<Text, AttendanceRecord>();

  func attendanceKey(empId : Nat, month : Nat, year : Nat) : Text {
    empId.toText() # "_" # month.toText() # "_" # year.toText();
  };

  public shared ({ caller }) func saveAttendance(
    employeeId : Nat, month : Nat, year : Nat, days : [Text]
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    let key = attendanceKey(employeeId, month, year);
    switch (attendanceRecords.get(key)) {
      case (?existing) {
        if (existing.isLocked) Runtime.trap("Attendance is locked");
      };
      case null {};
    };
    var present = 0;
    var absent = 0;
    for (d in days.vals()) {
      if (d == "present") present += 1
      else if (d == "halfday") present += 1
      else if (d == "absent") absent += 1;
    };
    attendanceRecords.add(key, {
      employeeId; month; year; days;
      totalPresent = present;
      totalAbsent = absent;
      isLocked = false;
    });
  };

  public shared ({ caller }) func lockAttendance(employeeId : Nat, month : Nat, year : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    let key = attendanceKey(employeeId, month, year);
    switch (attendanceRecords.get(key)) {
      case null Runtime.trap("Not found");
      case (?r) attendanceRecords.add(key, { r with isLocked = true });
    };
  };

  public query ({ caller }) func getAttendance(employeeId : Nat, month : Nat, year : Nat) : async ?AttendanceRecord {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) Runtime.trap("Unauthorized");
    attendanceRecords.get(attendanceKey(employeeId, month, year));
  };

  public query ({ caller }) func getAttendanceForInstitute(instituteId : Nat, month : Nat, year : Nat) : async [AttendanceRecord] {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    let lst = List.empty<AttendanceRecord>();
    for ((_, e) in employees.entries()) {
      if (e.instituteId == instituteId) {
        let key = attendanceKey(e.id, month, year);
        switch (attendanceRecords.get(key)) {
          case (?r) lst.add(r);
          case null {};
        };
      };
    };
    lst.toArray();
  };

  // ─── Salary ───────────────────────────────────────────────────────────────────

  public type SalaryRecord = {
    employeeId : Nat;
    month : Nat;
    year : Nat;
    basicSalary : Nat;
    da : Nat;
    hra : Nat;
    grossSalary : Nat;
    pf : Nat;
    esic : Nat;
    pt : Nat;
    totalDeductions : Nat;
    netSalary : Nat;
    isLocked : Bool;
  };

  let salaryRecords = Map.empty<Text, SalaryRecord>();

  func salaryKey(empId : Nat, month : Nat, year : Nat) : Text {
    empId.toText() # "_" # month.toText() # "_" # year.toText();
  };

  public shared ({ caller }) func processSalary(
    employeeId : Nat, month : Nat, year : Nat
  ) : async SalaryRecord {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    let key = salaryKey(employeeId, month, year);
    switch (salaryRecords.get(key)) {
      case (?existing) {
        if (existing.isLocked) Runtime.trap("Salary is locked");
      };
      case null {};
    };
    let emp = switch (employees.get(employeeId)) {
      case null Runtime.trap("Employee not found");
      case (?e) e;
    };
    let basic = emp.basicSalary;
    let da = (basic * 257) / 100;
    let hra = (basic * 20) / 100;
    let gross = basic + da + hra;
    let pf = (basic * 12) / 100;
    let esic = if (gross <= 21000) (gross * 75) / 10000 else 0;
    let pt = if (gross >= 15000) 200 else if (gross >= 10000) 150 else 0;
    let deductions = pf + esic + pt;
    let net : Nat = if (gross >= deductions) gross - deductions else 0;
    let record : SalaryRecord = {
      employeeId; month; year; basicSalary = basic;
      da; hra; grossSalary = gross; pf; esic; pt;
      totalDeductions = deductions; netSalary = net; isLocked = false;
    };
    salaryRecords.add(key, record);
    record;
  };

  public shared ({ caller }) func lockSalary(employeeId : Nat, month : Nat, year : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    let key = salaryKey(employeeId, month, year);
    switch (salaryRecords.get(key)) {
      case null Runtime.trap("Not found");
      case (?r) salaryRecords.add(key, { r with isLocked = true });
    };
  };

  public query ({ caller }) func getSalary(employeeId : Nat, month : Nat, year : Nat) : async ?SalaryRecord {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) Runtime.trap("Unauthorized");
    salaryRecords.get(salaryKey(employeeId, month, year));
  };

  public query ({ caller }) func getSalariesForInstitute(instituteId : Nat, month : Nat, year : Nat) : async [SalaryRecord] {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    let lst = List.empty<SalaryRecord>();
    for ((_, e) in employees.entries()) {
      if (e.instituteId == instituteId) {
        let key = salaryKey(e.id, month, year);
        switch (salaryRecords.get(key)) {
          case (?r) lst.add(r);
          case null {};
        };
      };
    };
    lst.toArray();
  };

  // ─── Daily Rated Workers ──────────────────────────────────────────────────────

  public type DailyWorker = {
    id : Nat;
    name : Text;
    ratePerDay : Nat;
    periodFrom : Text;
    periodTo : Text;
    attendanceDays : Nat;
    totalPayable : Nat;
    instituteId : Nat;
  };

  let dailyWorkers = Map.empty<Nat, DailyWorker>();
  var nextDailyWorkerId = 1;

  module DailyWorker {
    public func compare(a : DailyWorker, b : DailyWorker) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  public shared ({ caller }) func addDailyWorker(
    name : Text, ratePerDay : Nat, periodFrom : Text, periodTo : Text,
    attendanceDays : Nat, instituteId : Nat
  ) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    let id = nextDailyWorkerId;
    nextDailyWorkerId += 1;
    let totalPayable = ratePerDay * attendanceDays;
    dailyWorkers.add(id, { id; name; ratePerDay; periodFrom; periodTo; attendanceDays; totalPayable; instituteId });
    id;
  };

  public shared ({ caller }) func updateDailyWorker(
    id : Nat, name : Text, ratePerDay : Nat, periodFrom : Text, periodTo : Text,
    attendanceDays : Nat, instituteId : Nat
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    switch (dailyWorkers.get(id)) {
      case null Runtime.trap("Not found");
      case (?_) {
        let totalPayable = ratePerDay * attendanceDays;
        dailyWorkers.add(id, { id; name; ratePerDay; periodFrom; periodTo; attendanceDays; totalPayable; instituteId });
      };
    };
  };

  public shared ({ caller }) func deleteDailyWorker(id : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    switch (dailyWorkers.get(id)) {
      case null Runtime.trap("Not found");
      case (?_) dailyWorkers.remove(id);
    };
  };

  public query ({ caller }) func getDailyWorkersForInstitute(instituteId : Nat) : async [DailyWorker] {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    let lst = List.empty<DailyWorker>();
    for ((_, w) in dailyWorkers.entries()) {
      if (w.instituteId == instituteId) lst.add(w);
    };
    lst.toArray().sort();
  };

  public query ({ caller }) func getAllDailyWorkers() : async [DailyWorker] {
    if (not AccessControl.isAdmin(accessControlState, caller)) Runtime.trap("Unauthorized");
    dailyWorkers.values().toArray().sort();
  };
};
