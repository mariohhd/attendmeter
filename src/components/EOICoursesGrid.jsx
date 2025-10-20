import React, { useEffect, useState } from 'react';
import EOICourseCard from './EOICourseCard.jsx';

function getEOICoursesFromLocalStorage() {
  try {
    const data = localStorage.getItem('eoiCourses');
    if (!data) return [];
    const parsed = JSON.parse(data);
    // Parse session dates
    return parsed.map(course => ({
      ...course,
      sessions: course.sessions.map(s => ({ ...s, date: new Date(s.date) }))
    }));
  } catch {
    return [];
  }
}

export default function EOICoursesGrid({ sampleEOICourse }) {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    function updateCourses() {
      const localCourses = getEOICoursesFromLocalStorage();
      if (localCourses.length === 0 && sampleEOICourse) {
        setCourses([sampleEOICourse]);
      } else {
        setCourses(localCourses);
      }
    }
    updateCourses();
    window.addEventListener('storage', updateCourses);
    return () => window.removeEventListener('storage', updateCourses);
  }, [sampleEOICourse]);

  if (courses.length === 0) {
    return null;
  }

  return (
    <>
      {courses.map(course => (
        <div key={course.id}>
          <EOICourseCard course={course} />
        </div>
      ))}
    </>
  );
}
