import type {
  Attendance,
  AttendanceStatus,
  ClassInfo,
  Student,
} from "@/lib/types"

const FIRST_NAMES = [
  "张", "王", "李", "赵", "刘", "陈", "杨", "黄", "周", "吴",
  "徐", "孙", "马", "朱", "胡", "郭", "何", "高", "林", "罗",
]

const LAST_NAMES = [
  "伟", "芳", "娜", "秀英", "敏", "静", "丽", "强", "磊", "军",
  "洋", "勇", "艳", "杰", "娟", "涛", "明", "超", "秀兰", "霞",
  "平", "刚", "桂英", "华", "梅", "鑫", "玲", "婷", "宇", "浩",
]

const CLASS_NAMES = [
  "人文2401班",
  "人文2402班",
  "计算机2401班",
  "计算机2402班",
  "电子2401班",
]

const STATUS_SYMBOLS: Record<AttendanceStatus, string> = {
  present: "√",
  absent: "X",
  personal_leave: "△",
  sick_leave: "○",
  late: "+",
  early_leave: "–",
}

export const ALL_STATUSES: AttendanceStatus[] = [
  "present",
  "absent",
  "personal_leave",
  "sick_leave",
  "late",
  "early_leave",
]

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateStudentId(index: number): string {
  return `2024${String(index + 1).padStart(3, "0")}`
}

function generateName(): string {
  return randomPick(FIRST_NAMES) + randomPick(LAST_NAMES)
}

function generateDate(dayOffset: number): string {
  const today = new Date()
  const targetDate = new Date(today)
  targetDate.setDate(today.getDate() - dayOffset)
  const month = targetDate.getMonth() + 1
  const day = targetDate.getDate()
  return `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function generateStatus(): AttendanceStatus {
  const rand = Math.random()
  if (rand < 0.75) return "present"
  if (rand < 0.82) return "late"
  if (rand < 0.88) return "absent"
  if (rand < 0.93) return "personal_leave"
  if (rand < 0.97) return "sick_leave"
  return "early_leave"
}

export function getStatusSymbol(status: AttendanceStatus): string {
  return STATUS_SYMBOLS[status]
}

export function generateMockStudents(count: number = 50): Student[] {
  const students: Student[] = []
  for (let i = 0; i < count; i++) {
    students.push({
      student_id: generateStudentId(i),
      name: generateName(),
      class: CLASS_NAMES[i % CLASS_NAMES.length],
    })
  }
  return students
}

export function generateMockAttendances(
  students: Student[],
  days: number = 15
): Attendance[] {
  const attendances: Attendance[] = []
  let id = 1

  for (let day = 0; day < days; day++) {
    const date = generateDate(day)
    for (const student of students) {
      const status = generateStatus()
      attendances.push({
        id: id++,
        student_id: student.student_id,
        name: student.name,
        class: student.class,
        date,
        status,
        status_symbol: getStatusSymbol(status),
        remark: "",
      })
    }
  }

  return attendances
}

export function generateClassInfo(students: Student[]): ClassInfo[] {
  const classMap = new Map<string, number>()
  for (const student of students) {
    classMap.set(student.class, (classMap.get(student.class) || 0) + 1)
  }
  return Array.from(classMap.entries()).map(([name, student_count]) => ({
    name,
    student_count,
  }))
}

export class MockDatabase {
  students: Student[] = []
  attendances: Attendance[] = []
  private nextAttendanceId = 1

  constructor() {
    this.reset()
  }

  reset() {
    this.students = generateMockStudents(50)
    this.attendances = generateMockAttendances(this.students, 15)
    this.nextAttendanceId = this.attendances.length + 1
  }

  getClasses(): ClassInfo[] {
    return generateClassInfo(this.students)
  }

  getStudentById(studentId: string): Student | undefined {
    return this.students.find((s) => s.student_id === studentId)
  }

  addStudent(student: Student): Student {
    this.students.push(student)
    return student
  }

  updateStudent(studentId: string, updates: Partial<Student>): Student | null {
    const index = this.students.findIndex((s) => s.student_id === studentId)
    if (index === -1) return null
    this.students[index] = { ...this.students[index], ...updates }
    return this.students[index]
  }

  removeStudent(studentId: string): boolean {
    const index = this.students.findIndex((s) => s.student_id === studentId)
    if (index === -1) return false
    this.students.splice(index, 1)
    this.attendances = this.attendances.filter((a) => a.student_id !== studentId)
    return true
  }

  getAttendanceById(id: number): Attendance | undefined {
    return this.attendances.find((a) => a.id === id)
  }

  addAttendance(data: {
    student_id: string
    date: string
    status: AttendanceStatus
    remark?: string
  }): Attendance | null {
    const student = this.getStudentById(data.student_id)
    if (!student) return null

    const attendance: Attendance = {
      id: this.nextAttendanceId++,
      student_id: data.student_id,
      name: student.name,
      class: student.class,
      date: data.date,
      status: data.status,
      status_symbol: getStatusSymbol(data.status),
      remark: data.remark || "",
    }
    this.attendances.push(attendance)
    return attendance
  }

  updateAttendance(
    id: number,
    updates: { status?: AttendanceStatus; remark?: string }
  ): Attendance | null {
    const index = this.attendances.findIndex((a) => a.id === id)
    if (index === -1) return null

    if (updates.status) {
      this.attendances[index].status = updates.status
      this.attendances[index].status_symbol = getStatusSymbol(updates.status)
    }
    if (updates.remark !== undefined) {
      this.attendances[index].remark = updates.remark
    }
    return this.attendances[index]
  }

  removeAttendance(id: number): boolean {
    const index = this.attendances.findIndex((a) => a.id === id)
    if (index === -1) return false
    this.attendances.splice(index, 1)
    return true
  }
}

export const mockDb = new MockDatabase()
