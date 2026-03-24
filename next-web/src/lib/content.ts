import { cache } from 'react';
import coursesData from '@/data/courses.json';
import { aiTools } from '@/data/mockData';
import type { CourseRecord, ToolRecord } from '@/lib/catalog';

export const getCourses = cache(() => coursesData as CourseRecord[]);

export const getAITools = cache(() => aiTools as ToolRecord[]);
