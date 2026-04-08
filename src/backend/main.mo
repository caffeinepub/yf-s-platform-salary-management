import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

actor {
  // ── Preserve old stable variables (migration stubs) ──────────────────────
  // These must stay to satisfy M0169 compatibility checks.

  type UserRole = { #admin; #guest; #user };
  type AccessControlState = { var adminAssigned : Bool; userRoles : Map.Map<Principal, UserRole> };

  // Migration stub: accessControlState was previously managed by the caffeineai-authorization library.
  // It must remain here as a stable variable to satisfy M0169 upgrade compatibility.
  stable var accessControlState : AccessControlState = {
    var adminAssigned = false;
    userRoles = Map.empty<Principal, UserRole>();
  };

  type Institute = { id : Nat; name : Text; code : Text; location : Text };

  type Designation = {
    #professor; #lecturer; #scientist; #officer;
    #researchEngineer; #adminStaff; #humanResources;
  };

  type EmploymentType = { #regular; #temporary };

  type Employee = {
    id : Nat; name : Text; employeeId : Text; instituteId : Nat;
    designation : Designation; employmentType : EmploymentType;
    joiningDate : Text; address : Text; dob : Text; basicSalary : Nat;
  };

  type UserProfile = { name : Text; employeeId : ?Nat };

  type AttendanceRecord = {
    employeeId : Nat; month : Nat; year : Nat; days : [Text];
    totalPresent : Nat; totalAbsent : Nat; isLocked : Bool;
  };

  type SalaryRecord = {
    employeeId : Nat; month : Nat; year : Nat; basicSalary : Nat;
    da : Nat; hra : Nat; grossSalary : Nat; pf : Nat; esic : Nat; pt : Nat;
    totalDeductions : Nat; netSalary : Nat; isLocked : Bool;
  };

  type DailyWorker = {
    id : Nat; name : Text; ratePerDay : Nat; periodFrom : Text;
    periodTo : Text; attendanceDays : Nat; totalPayable : Nat; instituteId : Nat;
  };

  // Old stable Maps — kept for upgrade compatibility, no longer used
  let institutes = Map.empty<Nat, Institute>();
  let employees = Map.empty<Nat, Employee>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let principalToEmployeeId = Map.empty<Principal, Nat>();
  let attendanceRecords = Map.empty<Text, AttendanceRecord>();
  let salaryRecords = Map.empty<Text, SalaryRecord>();
  let dailyWorkers = Map.empty<Nat, DailyWorker>();

  var nextInstituteId = 1;
  var nextEmployeeId = 1;
  var nextDailyWorkerId = 1;

  // ── New simple key-value store (cross-device persistent storage) ──────────

  stable var kvEntries : [(Text, Text)] = [];
  let kvStore = Map.empty<Text, Text>();

  system func preupgrade() {
    kvEntries := kvStore.entries().toArray();
  };

  system func postupgrade() {
    for ((k, v) in kvEntries.vals()) {
      kvStore.add(k, v);
    };
    kvEntries := [];
  };

  public func set(key : Text, value : Text) : async () {
    kvStore.add(key, value);
  };

  public query func get(key : Text) : async ?Text {
    kvStore.get(key);
  };

  public func remove(key : Text) : async () {
    kvStore.remove(key);
  };

  public query func getAll() : async [(Text, Text)] {
    kvStore.entries().toArray();
  };
};
