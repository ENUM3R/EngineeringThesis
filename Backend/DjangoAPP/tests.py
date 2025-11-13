from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Task, UserProfile, CyclicTask, SubTask
from .serializers import TaskSerializer
from rest_framework.test import APIClient
from rest_framework import status
import json

class TaskModelTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        self.profile = UserProfile.objects.create(user=self.user, current_points=0)

    def test_task_creation_with_category(self):
        """Test creating a task with category field"""
        task = Task.objects.create(
            user=self.user,
            title="Test Task",
            category="work",
            priority=5,
            status="pending"
        )
        self.assertEqual(task.category, "work")
        self.assertEqual(task.title, "Test Task")

    def test_task_creation_with_location(self):
        """Test creating a task with location field"""
        task = Task.objects.create(
            user=self.user,
            title="Test Task",
            location="Office Building",
            priority=5,
            status="pending"
        )
        self.assertEqual(task.location, "Office Building")

    def test_task_creation_with_reminder_date(self):
        """Test creating a task with reminder_date field"""
        reminder_date = timezone.now() + timedelta(days=1)
        task = Task.objects.create(
            user=self.user,
            title="Test Task",
            reminder_date=reminder_date,
            priority=5,
            status="pending"
        )
        self.assertEqual(task.reminder_date, reminder_date)

    def test_task_default_category(self):
        """Test that task has default category 'private'"""
        task = Task.objects.create(
            user=self.user,
            title="Test Task",
            priority=5,
            status="pending"
        )
        self.assertEqual(task.category, "private")

    def test_task_category_choices(self):
        """Test that category field accepts valid choices"""
        valid_categories = ["work", "school", "private"]
        for category in valid_categories:
            task = Task.objects.create(
                user=self.user,
                title=f"Test Task {category}",
                category=category,
                priority=5,
                status="pending"
            )
            self.assertEqual(task.category, category)

    def test_task_calculate_points(self):
        """Test task points calculation"""
        start_date = timezone.now()
        end_date = start_date + timedelta(days=5)
        task = Task.objects.create(
            user=self.user,
            title="Test Task",
            start_date=start_date,
            end_date=end_date,
            priority=5,
            status="pending"
        )
        points = task.calculate_points()
        # Expected: 5 (priority) * 5 (days) * 10 = 250
        self.assertEqual(points, 250)
        self.assertEqual(task.points, 250)

    def test_task_with_all_new_fields(self):
        """Test creating a task with all new fields"""
        reminder_date = timezone.now() + timedelta(days=1)
        start_date = timezone.now()
        end_date = start_date + timedelta(days=3)
        
        task = Task.objects.create(
            user=self.user,
            title="Complete Project",
            description="Finish the project",
            category="work",
            location="Office",
            reminder_date=reminder_date,
            start_date=start_date,
            end_date=end_date,
            priority=8,
            status="pending"
        )
        
        self.assertEqual(task.category, "work")
        self.assertEqual(task.location, "Office")
        self.assertEqual(task.reminder_date, reminder_date)
        self.assertEqual(task.priority, 8)


class TaskSerializerTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass123')

    def test_task_serializer_includes_new_fields(self):
        """Test that TaskSerializer includes category, location, and reminder_date"""
        reminder_date = timezone.now() + timedelta(days=1)
        task = Task.objects.create(
            user=self.user,
            title="Test Task",
            category="school",
            location="Library",
            reminder_date=reminder_date,
            priority=5,
            status="pending"
        )
        
        serializer = TaskSerializer(task)
        data = serializer.data
        
        self.assertIn('category', data)
        self.assertIn('location', data)
        self.assertIn('reminder_date', data)
        self.assertEqual(data['category'], 'school')
        self.assertEqual(data['location'], 'Library')
        self.assertIsNotNone(data['reminder_date'])

    def test_task_serializer_creates_with_new_fields(self):
        """Test creating a task via serializer with new fields"""
        reminder_date = timezone.now() + timedelta(days=1)
        task_data = {
            'title': 'New Task',
            'category': 'work',
            'location': 'Home Office',
            'reminder_date': reminder_date.isoformat(),
            'priority': 7,
            'status': 'pending'
        }
        
        serializer = TaskSerializer(data=task_data)
        self.assertTrue(serializer.is_valid())
        task = serializer.save(user=self.user)
        
        self.assertEqual(task.category, 'work')
        self.assertEqual(task.location, 'Home Office')
        self.assertIsNotNone(task.reminder_date)


class TaskViewSetTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_create_task_with_category(self):
        """Test creating a task via API with category"""
        task_data = {
            'title': 'API Test Task',
            'category': 'work',
            'priority': 5,
            'status': 'pending'
        }
        
        response = self.client.post('/api/tasks/', task_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['category'], 'work')

    def test_create_task_with_location(self):
        """Test creating a task via API with location"""
        task_data = {
            'title': 'API Test Task',
            'location': 'Conference Room',
            'priority': 5,
            'status': 'pending'
        }
        
        response = self.client.post('/api/tasks/', task_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['location'], 'Conference Room')

    def test_create_task_with_reminder_date(self):
        """Test creating a task via API with reminder_date"""
        reminder_date = timezone.now() + timedelta(days=2)
        task_data = {
            'title': 'API Test Task',
            'reminder_date': reminder_date.isoformat(),
            'priority': 5,
            'status': 'pending'
        }
        
        response = self.client.post('/api/tasks/', task_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIsNotNone(response.data['reminder_date'])

    def test_create_task_with_all_new_fields(self):
        """Test creating a task via API with all new fields"""
        reminder_date = timezone.now() + timedelta(days=1)
        task_data = {
            'title': 'Complete Project',
            'description': 'Finish the project',
            'category': 'school',
            'location': 'University Library',
            'reminder_date': reminder_date.isoformat(),
            'priority': 8,
            'status': 'pending'
        }
        
        response = self.client.post('/api/tasks/', task_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['category'], 'school')
        self.assertEqual(response.data['location'], 'University Library')
        self.assertIsNotNone(response.data['reminder_date'])

    def test_update_task_category(self):
        """Test updating a task's category via API"""
        task = Task.objects.create(
            user=self.user,
            title="Test Task",
            category="private",
            priority=5,
            status="pending"
        )
        
        update_data = {
            'title': 'Test Task',
            'category': 'work',
            'priority': 5,
            'status': 'pending'
        }
        
        response = self.client.put(f'/api/tasks/{task.id}/', update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['category'], 'work')
        
        task.refresh_from_db()
        self.assertEqual(task.category, 'work')

    def test_update_task_location(self):
        """Test updating a task's location via API"""
        task = Task.objects.create(
            user=self.user,
            title="Test Task",
            location="Old Location",
            priority=5,
            status="pending"
        )
        
        update_data = {
            'title': 'Test Task',
            'location': 'New Location',
            'priority': 5,
            'status': 'pending'
        }
        
        response = self.client.put(f'/api/tasks/{task.id}/', update_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['location'], 'New Location')
        
        task.refresh_from_db()
        self.assertEqual(task.location, 'New Location')

    def test_get_task_list_includes_new_fields(self):
        """Test that task list API includes new fields"""
        Task.objects.create(
            user=self.user,
            title="Test Task 1",
            category="work",
            location="Office",
            priority=5,
            status="pending"
        )
        
        Task.objects.create(
            user=self.user,
            title="Test Task 2",
            category="school",
            location="Library",
            priority=3,
            status="pending"
        )
        
        response = self.client.get('/api/tasks/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        
        for task in response.data:
            self.assertIn('category', task)
            self.assertIn('location', task)
            self.assertIn('reminder_date', task)

    def test_mark_done_with_new_fields(self):
        """Test marking a task as done preserves new fields"""
        reminder_date = timezone.now() + timedelta(days=1)
        start_date = timezone.now()
        end_date = start_date + timedelta(days=2)
        
        task = Task.objects.create(
            user=self.user,
            title="Test Task",
            category="work",
            location="Office",
            reminder_date=reminder_date,
            start_date=start_date,
            end_date=end_date,
            priority=5,
            status="pending"
        )
        
        response = self.client.post(f'/api/tasks/{task.id}/mark_done/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        task.refresh_from_db()
        self.assertEqual(task.status, 'done')
        self.assertEqual(task.category, 'work')
        self.assertEqual(task.location, 'Office')
        self.assertIsNotNone(task.reminder_date)


class TaskCategoryTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass123')

    def test_category_work(self):
        """Test work category"""
        task = Task.objects.create(
            user=self.user,
            title="Work Task",
            category="work",
            priority=5,
            status="pending"
        )
        self.assertEqual(task.category, "work")

    def test_category_school(self):
        """Test school category"""
        task = Task.objects.create(
            user=self.user,
            title="School Task",
            category="school",
            priority=5,
            status="pending"
        )
        self.assertEqual(task.category, "school")

    def test_category_private(self):
        """Test private category"""
        task = Task.objects.create(
            user=self.user,
            title="Private Task",
            category="private",
            priority=5,
            status="pending"
        )
        self.assertEqual(task.category, "private")


class TaskReminderTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass123')

    def test_reminder_date_in_past(self):
        """Test reminder date in the past"""
        reminder_date = timezone.now() - timedelta(days=1)
        task = Task.objects.create(
            user=self.user,
            title="Past Reminder Task",
            reminder_date=reminder_date,
            priority=5,
            status="pending"
        )
        self.assertIsNotNone(task.reminder_date)
        self.assertLess(task.reminder_date, timezone.now())

    def test_reminder_date_in_future(self):
        """Test reminder date in the future"""
        reminder_date = timezone.now() + timedelta(days=5)
        task = Task.objects.create(
            user=self.user,
            title="Future Reminder Task",
            reminder_date=reminder_date,
            priority=5,
            status="pending"
        )
        self.assertIsNotNone(task.reminder_date)
        self.assertGreater(task.reminder_date, timezone.now())

    def test_reminder_date_optional(self):
        """Test that reminder_date is optional"""
        task = Task.objects.create(
            user=self.user,
            title="No Reminder Task",
            priority=5,
            status="pending"
        )
        self.assertIsNone(task.reminder_date)
