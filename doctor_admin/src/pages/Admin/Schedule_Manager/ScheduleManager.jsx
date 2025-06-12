import React, { useState, useEffect } from 'react';
import {
  Button,
  Space,
  Select,
  Form,
  TimePicker,
  message,
  Radio,
  Tag,
  Typography,
  Checkbox,
  Modal,
} from 'antd';
import {
  LeftOutlined,
  RightOutlined,
  SaveOutlined,
  CheckOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './ScheduleManager.css';
import {
  mockDoctors,
  mockSpecializations,
  shiftConfig,
  getMonday,
  getWeekDates,
  formatDate,
  formatDateWithWeekday,
  calculateHours,
  initialSchedule
} from '../../../utils/mockData';

const { Title } = Typography;

const ScheduleManager = () => {
  // State variables
  const [currentWeek, setCurrentWeek] = useState(() => getMonday(new Date()));
  const [schedule, setSchedule] = useState(initialSchedule);
  const [selectedCells, setSelectedCells] = useState([]);
  const [filters, setFilters] = useState({
    specialization: null,
    shift: null
  });
  const [isDraft, setIsDraft] = useState(true);
  const [weekDates, setWeekDates] = useState(() => getWeekDates(getMonday(new Date())));
  const [selectedCell, setSelectedCell] = useState(null);
  
  // Effects
  useEffect(() => {
    setWeekDates(getWeekDates(currentWeek));
  }, [currentWeek]);

  // Navigation handlers
  const previousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(getMonday(new Date()));
  };

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Cell selection handlers
  const handleCellClick = (doctorId, date) => {
    const key = `${doctorId}-${formatDate(date)}`;
    setSelectedCell(key);
  };

  const handleMultiSelect = (doctorId, date) => {
    const key = `${doctorId}-${formatDate(date)}`;
    if (selectedCells.includes(key)) {
      setSelectedCells(prev => prev.filter(cell => cell !== key));
    } else {
      setSelectedCells(prev => [...prev, key]);
    }
  };  // Shift management
  const handleShiftChange = (doctorId, date, shiftData) => {
    if (!shiftData || !doctorId || !date) {
      console.log('Missing required data for shift assignment');
      return;
    }

    try {
      const dateStr = formatDate(date);
      const key = `${doctorId}-${dateStr}`;
      const hours = calculateHours(shiftData.start_time, shiftData.end_time);
      
      setSchedule(prev => {
        const existingShifts = prev[key]?.shifts || [];
        
        // Check if this exact shift already exists
        const exactShiftExists = existingShifts.some(shift => 
          shift.type === shiftData.type && 
          shift.start_time === shiftData.start_time && 
          shift.end_time === shiftData.end_time
        );
        
        if (shiftData.action === 'remove' || exactShiftExists) {
          // Remove the specific shift
          const filteredShifts = existingShifts.filter(shift => 
            !(shift.type === shiftData.type && 
              shift.start_time === shiftData.start_time && 
              shift.end_time === shiftData.end_time)
          );
          
          return {
            ...prev,
            [key]: {
              shifts: filteredShifts,
              hours: filteredShifts.reduce((total, shift) => 
                total + calculateHours(shift.start_time, shift.end_time), 0
              )
            }
          };
        } else {
          // Validate new shift before adding
          if (!validateNewShift(existingShifts, shiftData)) {
            return prev;
          }

          // Add new shift
          const newShifts = [...existingShifts, { ...shiftData, hours }];
          
          // Calculate total hours for the day
          const totalHours = newShifts.reduce((total, shift) => 
            total + calculateHours(shift.start_time, shift.end_time), 0
          );

          // Check maximum hours per day (12 hours)
          if (totalHours > 12) {
            message.error('Total working hours per day cannot exceed 12 hours');
            return prev;
          }

          return {
            ...prev,
            [key]: {
              shifts: newShifts,
              hours: totalHours
            }
          };
        }
      });
      
      message.success('Schedule updated successfully');
    } catch (error) {
      console.error('Error updating schedule:', error);
      message.error('Failed to update schedule');
    }
    setSelectedCell(null);
  };
  const handleBulkShiftAssign = (shiftData) => {
    if (!shiftData) return;

    try {
      let successCount = 0;
      let failCount = 0;

      setSchedule(prev => {
        const newSchedule = { ...prev };
        
        selectedCells.forEach(key => {
          const [doctorId, dateStr] = key.split('-');
          const date = new Date(dateStr.split('/').reverse().join('-'));
          const existingShifts = newSchedule[key]?.shifts || [];
          const hours = calculateHours(shiftData.start_time, shiftData.end_time);

          // Validate the new shift for this cell
          if (validateNewShift(existingShifts, shiftData)) {
            // Calculate new total hours
            const newShifts = [...existingShifts, { ...shiftData, hours }];
            const totalHours = newShifts.reduce((total, shift) => 
              total + calculateHours(shift.start_time, shift.end_time), 0
            );

            // Check maximum hours
            if (totalHours <= 12) {
              newSchedule[key] = {
                shifts: newShifts,
                hours: totalHours
              };
              successCount++;
            } else {
              failCount++;
            }
          } else {
            failCount++;
          }
        });

        return newSchedule;
      });

      if (successCount > 0) {
        message.success(`Successfully assigned shifts to ${successCount} cells`);
      }
      if (failCount > 0) {
        message.warning(`Failed to assign shifts to ${failCount} cells due to conflicts or hour limits`);
      }
      setSelectedCells([]);
    } catch (error) {
      console.error('Error in bulk assignment:', error);
      message.error('Failed to assign shifts');
    }
  };

  // Save functionality
  const handleSaveDraft = () => {
    setIsDraft(true);
    message.success('Schedule draft saved');
  };

  const handleConfirmSchedule = () => {
    setIsDraft(false);
    message.success('Schedule confirmed');
  };

  // Calculate total hours
  const calculateTotalHours = (doctorId, type = 'week') => {
    let total = 0;
    weekDates.forEach(date => {
      const key = `${doctorId}-${formatDate(date)}`;
      if (schedule[key]) {
        if (type === 'week') {
          total += schedule[key].hours || 0;
        } else if (type === 'day' && formatDate(date) === type) {
          total += schedule[key].hours || 0;
        }
      }
    });
    return total.toFixed(1);
  };

  // Calculate hours for specific day
  const calculateDayHours = (doctorId, date) => {
    const key = `${doctorId}-${formatDate(date)}`;
    return schedule[key]?.hours || 0;
  };

  // Calculate number of doctors by specialization and time slot
  const calculateDoctorCount = (specialization, date, timeSlot) => {
    const doctorsInSpec = mockDoctors.filter(d => d.specialization === specialization);
    let count = 0;

    doctorsInSpec.forEach(doctor => {
      const key = `${doctor.doctor_id}-${formatDate(date)}`;
      const shifts = schedule[key]?.shifts || [];
      
      // Check if doctor has a shift at this time slot
      const hasShift = shifts.some(shift => 
        shift.start_time === timeSlot.start_time && 
        shift.end_time === timeSlot.end_time &&
        shift.type === timeSlot.type
      );
      
      if (hasShift) count++;
    });

    return count;
  };

  // Get all time slots from schedule
  const getTimeSlots = () => {
    const fixedSlots = [
      { type: 'morning', start_time: '07:00', end_time: '11:00' },
      { type: 'afternoon', start_time: '13:00', end_time: '17:00' }
    ];

    // Get unique custom time slots
    const customSlots = new Set();
    Object.values(schedule).forEach(cell => {
      (cell?.shifts || []).forEach(shift => {
        if (shift.isCustom) {
          customSlots.add(JSON.stringify({
            type: shift.type,
            start_time: shift.start_time,
            end_time: shift.end_time
          }));
        }
      });
    });

    return [...fixedSlots, ...Array.from(customSlots).map(slot => JSON.parse(slot))];
  };

  // Filter doctors based on current filters
  const filteredDoctors = mockDoctors.filter(doctor => {
    if (filters.specialization && doctor.specialization !== filters.specialization) {
      return false;
    }
    if (filters.shift) {
      const hasShift = weekDates.some(date => {
        const key = `${doctor.doctor_id}-${formatDate(date)}`;
        const shift = schedule[key];
        return shift && shift.type === filters.shift;
      });
      if (!hasShift) return false;
    }
    return true;
  });

  // Shift assignment form
  const ShiftForm = ({ doctorId, date, onSubmit, initialValues }) => {
    const [form] = Form.useForm();

    const handleSubmit = (values) => {
      onSubmit({
        type: values.shift_type,
        start_time: values.start_time.format('HH:mm'),
        end_time: values.end_time.format('HH:mm'),
        isCustom: true
      });
      form.resetFields();
    };

    return (
      <Form
        form={form}
        className="shift-form"
        onFinish={handleSubmit}
        initialValues={{
          ...initialValues,
          shift_type: 'morning'
        }}
      >
        <Form.Item 
          name="shift_type" 
          label="Shift Type" 
          rules={[{ required: true, message: 'Please select shift type' }]}
        >
          <Radio.Group>
            <Radio value="morning">Morning</Radio>
            <Radio value="afternoon">Afternoon</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item 
          name="start_time" 
          label="Start Time" 
          rules={[{ required: true, message: 'Please select start time' }]}
        >
          <TimePicker format="HH:mm" />
        </Form.Item>
        <Form.Item 
          name="end_time" 
          label="End Time" 
          rules={[{ required: true, message: 'Please select end time' }]}
        >
          <TimePicker format="HH:mm" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Add Custom Shift
          </Button>
        </Form.Item>
      </Form>
    );
  };
  // Render shift cell content
  const renderShiftCell = (doctorId, date) => {
    const key = `${doctorId}-${formatDate(date)}`;
    const cellData = schedule[key];
    const isSelected = selectedCells.includes(key);
    const doctor = mockDoctors.find(d => d.doctor_id === doctorId);

    const hasShift = (type) => {
      return cellData?.shifts?.some(shift => shift.type === type);
    };

    const isShiftActive = (type, startTime, endTime) => {
      return cellData?.shifts?.some(shift => 
        shift.type === type && 
        shift.start_time === startTime && 
        shift.end_time === endTime
      );
    };

    const toggleShift = (shiftData) => {
      const isActive = isShiftActive(shiftData.type, shiftData.start_time, shiftData.end_time);
      if (isActive) {
        // Remove this specific shift
        handleShiftChange(doctorId, date, {
          ...shiftData,
          action: 'remove'
        });
      } else {
        // Add the shift
        handleShiftChange(doctorId, date, shiftData);
      }
    };    return (
      <div 
        className={`shift-cell${isSelected ? ' selected' : ''}`}
        onClick={(e) => {
          // Nếu click vào vùng trống hoặc department, chọn cả ô
          if (e.target.classList.contains('shift-cell') || 
              e.target.classList.contains('doctor-department')) {
            handleMultiSelect(doctorId, date);
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          handleMultiSelect(doctorId, date);
        }}
      >
        <div className="shift-options" onClick={(e) => e.stopPropagation()}>
          {/* Fixed shifts */}
          <div 
            className={`shift-checkbox morning${isShiftActive('morning', '07:00', '11:00') ? ' active' : ''}`}
            onClick={() => toggleShift({
              type: 'morning',
              start_time: '07:00',
              end_time: '11:00',
              isFixed: true
            })}
          >
            7:00 - 11:00
          </div>
          <div 
            className={`shift-checkbox afternoon${isShiftActive('afternoon', '13:00', '17:00') ? ' active' : ''}`}
            onClick={() => toggleShift({
              type: 'afternoon',
              start_time: '13:00',
              end_time: '17:00',
              isFixed: true
            })}
          >
            13:00 - 17:00
          </div>
          
          {/* Custom shifts */}
          {cellData?.shifts?.filter(shift => shift.isCustom).map((shift, index) => (
            <div 
              key={index} 
              className={`shift-checkbox ${shift.type}${isShiftActive(shift.type, shift.start_time, shift.end_time) ? ' active' : ''}`}
              onClick={() => toggleShift(shift)}
            >
              {shift.start_time} - {shift.end_time}
            </div>
          ))}
          
          <Button 
            type="text" 
            icon={<PlusOutlined />} 
            onClick={() => handleCellClick(doctorId, date)}
          />
        </div>

        <div className="doctor-department">
          {doctor.specialization}
        </div>
      </div>
    );
  };

  // Helper functions for shift management
  const checkShiftConflict = (shift1, shift2) => {
    const start1 = dayjs(`2000-01-01 ${shift1.start_time}`);
    const end1 = dayjs(`2000-01-01 ${shift1.end_time}`);
    const start2 = dayjs(`2000-01-01 ${shift2.start_time}`);
    const end2 = dayjs(`2000-01-01 ${shift2.end_time}`);

    return (start1.isBefore(end2) && end1.isAfter(start2));
  };

  const validateNewShift = (existingShifts, newShift) => {
    // Check for conflicts with existing shifts
    const hasConflict = existingShifts.some(shift => checkShiftConflict(shift, newShift));
    if (hasConflict) {
      message.error('This shift conflicts with an existing shift');
      return false;
    }

    // Validate shift duration (minimum 1 hour, maximum 8 hours)
    const start = dayjs(`2000-01-01 ${newShift.start_time}`);
    const end = dayjs(`2000-01-01 ${newShift.end_time}`);
    const duration = end.diff(start, 'hour', true);

    if (duration < 1) {
      message.error('Shift duration must be at least 1 hour');
      return false;
    }
    if (duration > 8) {
      message.error('Shift duration cannot exceed 8 hours');
      return false;
    }

    return true;
  };

  // Return component JSX
  return (
    <div className="schedule-manager">
      <div className="schedule-header">
        <Title level={2}>Schedule Manager</Title>
        
        <div className="week-navigation">
          <div className="current-week">
            Week: {formatDate(weekDates[0])} - {formatDate(weekDates[6])}
          </div>
          <Space>
            <Button icon={<LeftOutlined />} onClick={previousWeek} />
            <Button onClick={goToCurrentWeek}>Current Week</Button>
            <Button icon={<RightOutlined />} onClick={nextWeek} />
          </Space>
        </div>

        <div className="header-buttons">
          <Button 
            icon={<SaveOutlined />} 
            onClick={handleSaveDraft}
            disabled={!isDraft}
          >
            Save Draft
          </Button>
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleConfirmSchedule}
            disabled={!isDraft}
          >
            Confirm Schedule
          </Button>
        </div>
      </div>

      <div className="filters-section">
        <Space size="large">
          <Select
            placeholder="Filter by Specialization"
            style={{ width: 200 }}
            allowClear
            onChange={(value) => handleFilterChange('specialization', value)}
            options={mockSpecializations.map(spec => ({
              label: spec.name,
              value: spec.name
            }))}
          />
          <Select
            placeholder="Filter by Shift"
            style={{ width: 200 }}
            allowClear
            onChange={(value) => handleFilterChange('shift', value)}
            options={[
              { label: 'Morning Shift', value: 'morning' },
              { label: 'Afternoon Shift', value: 'afternoon' }
            ]}
          />
        </Space>
      </div>


      <div className="schedule-grid">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>Doctor</th>
              {weekDates.map(date => (
                <th key={date.toString()}>{formatDateWithWeekday(date)}</th>
              ))}
              <th>Total Hours</th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.map(doctor => (
              <tr key={doctor.doctor_id}>
                <td className="doctor-info">
                  <div className="doctor-name">{doctor.name}</div>
                  <div className="doctor-id">ID: {doctor.doctor_id}</div>
                  <div className="doctor-spec">{doctor.specialization}</div>
                </td>
                {weekDates.map(date => (
                  <td key={date.toString()} className="editable-cell">
                    {renderShiftCell(doctor.doctor_id, date)}
                  </td>
                ))}
                <td>{calculateTotalHours(doctor.doctor_id)} hrs</td>
              </tr>
            ))}
          </tbody>
        </table>      
        </div>      
        
      <div className="department-summary">
        <Title level={3}>Department Schedule Summary</Title>
        <table className="schedule-table department-table">
          <thead>
            <tr>
              <th>Department</th>
              {weekDates.map(date => (
                <th key={date.toString()}>{formatDateWithWeekday(date)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mockSpecializations.map(spec => (
              <tr key={spec.name}>
                <td className="department-info">
                  <div className="department-name">{spec.name}</div>
                </td>
                {weekDates.map(date => (
                  <td key={date.toString()} className="department-cell">
                    {getTimeSlots().map((slot, index) => {
                      const count = calculateDoctorCount(spec.name, date, slot);
                      if (count > 0) {
                        return (
                          <div 
                            key={index} 
                            className={`time-slot ${slot.type}`}
                          >
                            {`${slot.start_time} - ${slot.end_time}: ${count} doctors`}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
        <div className="schedule-summary">
        <Title level={3}>Weekly Working Hours Summary</Title>
        <table className="schedule-table summary-table">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Total</th>
              {weekDates.map(date => (
                <th key={date.toString()}>{formatDateWithWeekday(date)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.map(doctor => (
              <tr key={doctor.doctor_id}>
                <td className="doctor-info">
                  <div className="doctor-name">{doctor.name}</div>
                  <div className="doctor-spec">{doctor.specialization}</div>
                </td>
                <td className="total-hours">
                  {calculateTotalHours(doctor.doctor_id)} hrs
                </td>
                {weekDates.map(date => (
                  <td key={date.toString()} className="day-hours">
                    {calculateDayHours(doctor.doctor_id, date).toFixed(1)} hrs
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {/* Shift Assignment Modal */}
      <Modal
        title="Assign Shift"
        open={!!selectedCell}
        onCancel={() => setSelectedCell(null)}
        footer={null}
      >
        {selectedCell && (
          <ShiftForm
            doctorId={selectedCell.split('-')[0]}
            date={selectedCell.split('-')[1]}
            onSubmit={(data) => handleShiftChange(
              selectedCell.split('-')[0],
              new Date(selectedCell.split('-')[1].split('/').reverse().join('-')),
              data
            )}
            initialValues={schedule[selectedCell]}
          />
        )}
      </Modal>

      {/* Bulk Assignment Controls */}
      {selectedCells.length > 0 && (
        <div className="selection-controls">
          <Typography.Text>
            {selectedCells.length} cells selected
          </Typography.Text>
          <ShiftForm
            onSubmit={handleBulkShiftAssign}
          />
        </div>
      )}
    </div>
  );
};

export default ScheduleManager;