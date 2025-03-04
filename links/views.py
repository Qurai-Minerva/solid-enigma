from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.middleware.csrf import get_token
from .models import Group, Link  # Import the Link model
import json
from django.shortcuts import render, get_object_or_404


# Signup View
def signup(request):
    if request.method == "POST":
        fullname = request.POST["fullname"]
        email = request.POST["email"]
        password = request.POST["password"]
        confirm_password = request.POST["confirm_password"]

        if password != confirm_password:
            messages.error(request, "Passwords do not match!")
            return render(request, "links/signup.html")

        # Create user
        user = User.objects.create_user(username=email, email=email, password=password)
        user.first_name = fullname
        user.save()

        messages.success(request, "Signup successful! You can now log in.")
        return redirect("login")  # Redirect to login view

    return render(request, "links/signup.html")

# Login View
def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            messages.success(request, "Login successful!")
            return redirect("index")  # Redirect to the dashboard view
        else:
            messages.error(request, "Invalid username or password.")
            return render(request, 'links/login.html')

    return render(request, 'links/login.html')

# Logout View
def logout_view(request):
    logout(request)  # Logs out the user
    return redirect('login')  # Redirect to the login page

# Get CSRF Token
def get_csrf_token(request):
    return JsonResponse({'csrfToken': get_token(request)})

# Dashboard View
@login_required
def index(request):
    groups = Group.objects.filter(user=request.user)
    return render(request, 'links/index.html', {'groups': groups})

# Add Group View
@csrf_exempt
@login_required
def add_group(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        name = data.get('name')
        description = data.get('description')

        if name:
            group = Group.objects.create(user=request.user, name=name, description=description)
            return JsonResponse({'success': True, 'group': {'id': group.id, 'name': group.name, 'description': group.description}})
        else:
            return JsonResponse({'success': False, 'error': 'Group name is required.'})

    return JsonResponse({'success': False, 'error': 'Invalid request method.'})

# Delete Group View
@csrf_exempt
@login_required
def delete_group(request, group_id):
    if request.method == 'DELETE':
        try:
            group = Group.objects.get(id=group_id, user=request.user)
            group.links.all().delete()  # Delete related links
            group.delete()
            return JsonResponse({'success': True})
        except Group.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Group not found.'})
    return JsonResponse({'success': False, 'error': 'Invalid request method.'})

# Group Detail View
@login_required
def group_detail(request, group_id):
    try:
        group = Group.objects.get(id=group_id, user=request.user)
        return render(request, 'links/group_detail.html', {'group': group})
    except Group.DoesNotExist:
        messages.error(request, "Group not found.")
        return redirect('index')
    
@csrf_exempt
@login_required
def add_link(request, group_id):
    if request.method == 'POST':
        try:
            group = Group.objects.get(id=group_id, user=request.user)
            data = json.loads(request.body)
            link_title = data.get('link_title')  # Use 'link_title' instead of 'link_name'
            link_url = data.get('link_url')

            if link_title and link_url:
                link = Link.objects.create(group=group, title=link_title, url=link_url)  # Use 'title' instead of 'name'
                return JsonResponse({'success': True, 'link': {'id': link.id, 'title': link.title, 'url': link.url}})
            else:
                return JsonResponse({'success': False, 'error': 'Link title and URL are required.'})
        except Group.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Group not found.'})
    return JsonResponse({'success': False, 'error': 'Invalid request method.'})

@csrf_exempt
@login_required
def edit_link(request, link_id):
    if request.method == 'POST':
        try:
            link = Link.objects.get(id=link_id, group__user=request.user)  # Ensure the link belongs to the user
            data = json.loads(request.body)
            link_title = data.get('link_title')  # Use 'link_title' instead of 'link_name'
            link_url = data.get('link_url')

            if link_title and link_url:
                link.title = link_title  # Use 'title' instead of 'name'
                link.url = link_url
                link.save()
                return JsonResponse({'success': True, 'link': {'id': link.id, 'title': link.title, 'url': link.url}})
            else:
                return JsonResponse({'success': False, 'error': 'Link title and URL are required.'})
        except Link.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Link not found.'})
    return JsonResponse({'success': False, 'error': 'Invalid request method.'})

@csrf_exempt
@login_required
def delete_link(request, link_id):
    if request.method == 'DELETE':
        try:
            link = Link.objects.get(id=link_id, group__user=request.user)  # Ensure the link belongs to the user
            link.delete()
            return JsonResponse({'success': True})
        except Link.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Link not found.'})
    return JsonResponse({'success': False, 'error': 'Invalid request method.'})


def public_link_page(request, group_id):
    group = get_object_or_404(Group, id=group_id)
    links = group.links.all().order_by('position')  # Order links by position
    return render(request, 'links/public_link_page.html', {'group': group, 'links': links})

@csrf_exempt
@login_required
def update_link_order(request, group_id):
    if request.method == 'POST':
        try:
            group = Group.objects.get(id=group_id, user=request.user)
            data = json.loads(request.body)
            link_order = data.get('link_order', [])

            # Update the position of each link
            for index, link_id in enumerate(link_order):
                link = Link.objects.get(id=link_id, group=group)
                link.position = index
                link.save()

            return JsonResponse({'success': True})
        except Group.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Group not found.'})
        except Link.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Link not found.'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request method.'})


@csrf_exempt
@login_required
def update_group(request, group_id):
    if request.method == 'POST':
        try:
            group = Group.objects.get(id=group_id, user=request.user)
            data = json.loads(request.body)
            new_name = data.get('group_name')
            new_description = data.get('group_description')

            if new_name and new_description:
                group.name = new_name
                group.description = new_description
                group.save()
                return JsonResponse({
                    'success': True,
                    'new_name': group.name,
                    'new_description': group.description
                })
            else:
                return JsonResponse({'success': False, 'error': 'Group name and description cannot be empty.'})
        except Group.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Group not found.'})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request method.'})

def public_link_page(request, group_id):
    group = get_object_or_404(Group, id=group_id)
    links = group.links.all().order_by('position')

    # Track link clicks
    if request.method == 'POST' and 'link_id' in request.POST:
        link_id = request.POST['link_id']
        link = get_object_or_404(Link, id=link_id)
        link.clicks += 1
        link.save()
        return JsonResponse({'success': True})

    return render(request, 'links/public_link_page.html', {'group': group, 'links': links})


def analytics(request, group_id):
    group = get_object_or_404(Group, id=group_id, user=request.user)
    links = group.links.all().order_by('-clicks')
    links_json = json.dumps([{'title': link.title, 'clicks': link.clicks} for link in links])
    return render(request, 'links/analytics.html', {'group': group, 'links_json': links_json})