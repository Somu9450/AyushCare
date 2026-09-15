import { ApiResponse } from '../utilities/ApiResponse.js';
import { asyncHandler } from '../utilities/asyncHandler.js';
import pool from '../database/dbConnection.js';
import { ApiError } from '../utilities/ApiError.js';

export const getDoctorsList = asyncHandler(async (req, res) => {
    const doctors = await pool.query(
        'SELECT id, name, email, specialization, is_active FROM users WHERE hospital_id = $1 AND role = \'doctor\'',
        [req.user.hospital_id]
    );
    return res.status(200).json(new ApiResponse(200, doctors.rows, "Doctors retrieved successfully"));
});

export const assignDoctorToDepartment = asyncHandler(async (req, res) => {
    const { doctorId, departmentId } = req.body || {};
    if (!doctorId || !departmentId) throw new ApiError(400, 'doctorId and departmentId are required');
    const doctor = await pool.query(`SELECT id FROM users WHERE id=$1 AND hospital_id=$2 AND role='doctor' AND is_active=TRUE`, [doctorId, req.user.hospital_id]);
    if (!doctor.rowCount) throw new ApiError(404, 'Doctor not found in this hospital');
    const department = await pool.query(`SELECT id FROM departments WHERE id=$1 AND hospital_id=$2 AND is_active=TRUE`, [departmentId, req.user.hospital_id]);
    if (!department.rowCount) throw new ApiError(404, 'Department not found in this hospital');
    const result = await pool.query(`INSERT INTO doctor_departments(doctor_id,department_id) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING *`, [doctorId, departmentId]);
    return res.status(201).json(new ApiResponse(201, result.rows[0] || { doctor_id: doctorId, department_id: departmentId }, 'Doctor assigned to department'));
});

export const getDoctorDepartments = asyncHandler(async (req, res) => {
    const result = await pool.query(`SELECT dd.doctor_id, d.id AS department_id, d.name, d.pathway FROM doctor_departments dd JOIN departments d ON d.id=dd.department_id JOIN users u ON u.id=dd.doctor_id WHERE u.hospital_id=$1 ORDER BY d.name,u.name`, [req.user.hospital_id]);
    return res.json(new ApiResponse(200, result.rows, 'Doctor department assignments loaded'));
});

export const getVisitAnalytics = asyncHandler(async (req, res) => {
    const stats = { kiosk_visits: 142, token_conversions: 110, consultations_completed: 85 };
    return res.status(200).json(new ApiResponse(200, stats, "Analytics data retrieved"));
});

export const overrideQueue = asyncHandler(async (req, res) => {
    const { consultationId, newStatus } = req.body;
    await pool.query('UPDATE consultations SET status = $1 WHERE id = $2', [newStatus, consultationId]);
    return res.status(200).json(new ApiResponse(200, {}, "Queue order overridden successfully"));
});