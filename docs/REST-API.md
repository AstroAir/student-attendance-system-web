# 学生考勤系统 RESTful API 接口文档

## 概述

本文档定义了学生考勤系统的 RESTful API 接口规范。

- **Base URL**: `/api/v1`
- **数据格式**: JSON
- **字符编码**: UTF-8

---

## 通用响应格式

### 成功响应

```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

### 错误响应

```json
{
  "code": 400,
  "message": "错误描述",
  "errors": [ ... ]
}
```

### HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 204 | 删除成功（无返回内容） |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 409 | 资源冲突（如学号重复） |
| 500 | 服务器内部错误 |

---

## 考勤状态符号

| 符号 | 状态 | 英文标识 |
|------|------|----------|
| √ | 出勤 | `present` |
| X | 旷课 | `absent` |
| △ | 事假 | `personal_leave` |
| ○ | 病假 | `sick_leave` |
| + | 迟到 | `late` |
| – | 早退 | `early_leave` |

---

## 1. 学生管理接口

### 1.1 获取学生列表

获取所有学生信息，支持分页和排序。

**请求**

```
GET /api/v1/students
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | integer | 否 | 页码，默认 1 |
| page_size | integer | 否 | 每页数量，默认 20 |
| sort_by | string | 否 | 排序字段：`student_id`, `name`, `class` |
| order | string | 否 | 排序方向：`asc`, `desc`，默认 `asc` |
| class | string | 否 | 按班级筛选 |
| keyword | string | 否 | 按学号或姓名模糊搜索 |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 100,
    "page": 1,
    "page_size": 20,
    "items": [
      {
        "student_id": "2024001",
        "name": "张三",
        "class": "人文2401班"
      }
    ]
  }
}
```

---

### 1.2 获取单个学生信息

**请求**

```
GET /api/v1/students/{student_id}
```

**路径参数**

| 参数 | 类型 | 说明 |
|------|------|------|
| student_id | string | 学号（唯一标识） |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "student_id": "2024001",
    "name": "张三",
    "class": "人文2401班"
  }
}
```

---

### 1.3 新增学生

**请求**

```
POST /api/v1/students
```

**请求体**

```json
{
  "student_id": "2024001",
  "name": "张三",
  "class": "人文2401班"
}
```

**字段说明**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| student_id | string | 是 | 学号，唯一，不可重复 |
| name | string | 是 | 姓名 |
| class | string | 是 | 班级 |

**响应示例**

```json
{
  "code": 201,
  "message": "学生创建成功",
  "data": {
    "student_id": "2024001",
    "name": "张三",
    "class": "人文2401班"
  }
}
```

**错误响应（学号重复）**

```json
{
  "code": 409,
  "message": "学号已存在，不可重复添加"
}
```

---

### 1.4 修改学生信息

**请求**

```
PUT /api/v1/students/{student_id}
```

**请求体**

```json
{
  "name": "张三（改）",
  "class": "人文2402班"
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "学生信息更新成功",
  "data": {
    "student_id": "2024001",
    "name": "张三（改）",
    "class": "人文2402班"
  }
}
```

---

### 1.5 删除学生

**请求**

```
DELETE /api/v1/students/{student_id}
```

**响应**

```
HTTP 204 No Content
```

---

## 2. 考勤记录接口

### 2.1 获取考勤记录列表

**请求**

```
GET /api/v1/attendances
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | integer | 否 | 页码，默认 1 |
| page_size | integer | 否 | 每页数量，默认 20 |
| student_id | string | 否 | 按学号筛选 |
| name | string | 否 | 按姓名筛选 |
| class | string | 否 | 按班级筛选 |
| date | string | 否 | 按日期筛选，格式：`MM-DD` |
| start_date | string | 否 | 开始日期，格式：`MM-DD` |
| end_date | string | 否 | 结束日期，格式：`MM-DD` |
| status | string | 否 | 考勤状态筛选 |
| sort_by | string | 否 | 排序字段：`student_id`, `name`, `date` |
| order | string | 否 | 排序方向：`asc`, `desc` |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 500,
    "page": 1,
    "page_size": 20,
    "items": [
      {
        "id": 1,
        "student_id": "2024001",
        "name": "张三",
        "class": "人文2401班",
        "date": "12-15",
        "status": "present",
        "status_symbol": "√",
        "remark": ""
      }
    ]
  }
}
```

---

### 2.2 获取单条考勤记录

**请求**

```
GET /api/v1/attendances/{id}
```

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "student_id": "2024001",
    "name": "张三",
    "class": "人文2401班",
    "date": "12-15",
    "status": "present",
    "status_symbol": "√",
    "remark": ""
  }
}
```

---

### 2.3 新增考勤记录

**请求**

```
POST /api/v1/attendances
```

**请求体**

```json
{
  "student_id": "2024001",
  "date": "12-15",
  "status": "present",
  "remark": ""
}
```

**字段说明**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| student_id | string | 是 | 学号 |
| date | string | 是 | 考勤日期，格式：`MM-DD` |
| status | string | 是 | 考勤状态：`present`, `absent`, `personal_leave`, `sick_leave`, `late`, `early_leave` |
| remark | string | 否 | 备注 |

**响应示例**

```json
{
  "code": 201,
  "message": "考勤记录创建成功",
  "data": {
    "id": 1,
    "student_id": "2024001",
    "name": "张三",
    "class": "人文2401班",
    "date": "12-15",
    "status": "present",
    "status_symbol": "√",
    "remark": ""
  }
}
```

---

### 2.4 批量新增考勤记录

**请求**

```
POST /api/v1/attendances/batch
```

**请求体**

```json
{
  "date": "12-15",
  "records": [
    { "student_id": "2024001", "status": "present" },
    { "student_id": "2024002", "status": "late" },
    { "student_id": "2024003", "status": "absent" }
  ]
}
```

**响应示例**

```json
{
  "code": 201,
  "message": "批量创建成功",
  "data": {
    "created_count": 3
  }
}
```

---

### 2.5 修改考勤记录

**请求**

```
PUT /api/v1/attendances/{id}
```

**请求体**

```json
{
  "status": "late",
  "remark": "迟到5分钟"
}
```

**响应示例**

```json
{
  "code": 200,
  "message": "考勤记录更新成功",
  "data": {
    "id": 1,
    "student_id": "2024001",
    "name": "张三",
    "class": "人文2401班",
    "date": "12-15",
    "status": "late",
    "status_symbol": "+",
    "remark": "迟到5分钟"
  }
}
```

---

### 2.6 删除考勤记录

**请求**

```
DELETE /api/v1/attendances/{id}
```

**响应**

```
HTTP 204 No Content
```

---

## 3. 统计报表接口

### 3.1 考勤明细表

获取指定时间段内的考勤明细。

**请求**

```
GET /api/v1/reports/details
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| start_date | string | 是 | 开始日期，格式：`MM-DD` |
| end_date | string | 是 | 结束日期，格式：`MM-DD` |
| class | string | 否 | 按班级筛选 |
| student_id | string | 否 | 按学号筛选 |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "period": {
      "start_date": "12-01",
      "end_date": "12-15"
    },
    "records": [
      {
        "student_id": "2024001",
        "name": "张三",
        "class": "人文2401班",
        "attendance_details": [
          { "date": "12-01", "status": "present", "symbol": "√" },
          { "date": "12-02", "status": "late", "symbol": "+" }
        ]
      }
    ]
  }
}
```

---

### 3.2 考勤日报表

获取指定日期的考勤统计。

**请求**

```
GET /api/v1/reports/daily
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| date | string | 是 | 日期，格式：`MM-DD` |
| class | string | 否 | 按班级筛选 |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "date": "12-15",
    "summary": {
      "total_students": 50,
      "present": 45,
      "absent": 2,
      "late": 1,
      "early_leave": 0,
      "personal_leave": 1,
      "sick_leave": 1,
      "attendance_rate": "90.00%"
    },
    "details": [
      {
        "student_id": "2024001",
        "name": "张三",
        "class": "人文2401班",
        "status": "present",
        "symbol": "√"
      }
    ]
  }
}
```

---

### 3.3 考勤汇总表

获取指定时间段内的考勤汇总统计。

**请求**

```
GET /api/v1/reports/summary
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| start_date | string | 是 | 开始日期 |
| end_date | string | 是 | 结束日期 |
| class | string | 否 | 按班级筛选 |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "period": {
      "start_date": "12-01",
      "end_date": "12-15"
    },
    "summary": [
      {
        "student_id": "2024001",
        "name": "张三",
        "class": "人文2401班",
        "total_days": 15,
        "present_count": 13,
        "absent_count": 0,
        "late_count": 1,
        "early_leave_count": 0,
        "personal_leave_count": 1,
        "sick_leave_count": 0,
        "attendance_rate": "86.67%"
      }
    ]
  }
}
```

---

### 3.4 考勤异常表

获取考勤异常记录（旷课、迟到、早退）。

**请求**

```
GET /api/v1/reports/abnormal
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| start_date | string | 是 | 开始日期 |
| end_date | string | 是 | 结束日期 |
| class | string | 否 | 按班级筛选 |
| type | string | 否 | 异常类型：`absent`, `late`, `early_leave`，不填则返回全部 |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "period": {
      "start_date": "12-01",
      "end_date": "12-15"
    },
    "abnormal_records": [
      {
        "student_id": "2024002",
        "name": "李四",
        "class": "人文2401班",
        "date": "12-05",
        "status": "absent",
        "symbol": "X",
        "remark": ""
      }
    ],
    "statistics": {
      "total_abnormal": 10,
      "absent_count": 5,
      "late_count": 3,
      "early_leave_count": 2
    }
  }
}
```

---

### 3.5 请假汇总表

获取请假记录汇总。

**请求**

```
GET /api/v1/reports/leave
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| start_date | string | 是 | 开始日期 |
| end_date | string | 是 | 结束日期 |
| class | string | 否 | 按班级筛选 |
| type | string | 否 | 请假类型：`personal_leave`, `sick_leave` |

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "period": {
      "start_date": "12-01",
      "end_date": "12-15"
    },
    "leave_records": [
      {
        "student_id": "2024003",
        "name": "王五",
        "class": "人文2401班",
        "date": "12-10",
        "type": "sick_leave",
        "symbol": "○",
        "remark": "感冒发烧"
      }
    ],
    "statistics": {
      "total_leave": 8,
      "personal_leave_count": 3,
      "sick_leave_count": 5
    }
  }
}
```

---

## 4. 数据导入导出接口

### 4.1 导出数据

**请求**

```
GET /api/v1/data/export
```

**查询参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| type | string | 是 | 导出类型：`students`, `attendances`, `all` |
| format | string | 否 | 导出格式：`json`, `csv`，默认 `json` |

**响应**

返回文件下载。

---

### 4.2 导入数据

**请求**

```
POST /api/v1/data/import
```

**请求体**

`multipart/form-data` 格式，包含上传的文件。

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| file | file | 是 | 数据文件（JSON 或 CSV） |
| type | string | 是 | 导入类型：`students`, `attendances` |

**响应示例**

```json
{
  "code": 200,
  "message": "导入成功",
  "data": {
    "imported_count": 50,
    "skipped_count": 2,
    "errors": [
      { "line": 10, "message": "学号格式不正确" }
    ]
  }
}
```

---

## 5. 班级管理接口

### 5.1 获取班级列表

**请求**

```
GET /api/v1/classes
```

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "name": "人文2401班",
      "student_count": 50
    },
    {
      "name": "人文2402班",
      "student_count": 48
    }
  ]
}
```

---

### 5.2 获取班级学生列表

**请求**

```
GET /api/v1/classes/{class_name}/students
```

**响应示例**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "class": "人文2401班",
    "students": [
      {
        "student_id": "2024001",
        "name": "张三"
      }
    ]
  }
}
```

---

## 附录：数据模型

### Student（学生）

| 字段 | 类型 | 说明 |
|------|------|------|
| student_id | string | 学号（主键，唯一） |
| name | string | 姓名 |
| class | string | 班级 |

### Attendance（考勤记录）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | integer | 记录ID（主键） |
| student_id | string | 学号（外键） |
| date | string | 考勤日期（MM-DD） |
| status | string | 考勤状态 |
| remark | string | 备注 |

### AttendanceStatus（考勤状态枚举）

| 值 | 说明 | 符号 |
|------|------|------|
| present | 出勤 | √ |
| absent | 旷课 | X |
| personal_leave | 事假 | △ |
| sick_leave | 病假 | ○ |
| late | 迟到 | + |
| early_leave | 早退 | – |
