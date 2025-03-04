from django.urls import path
from . import views

urlpatterns = [
    # Authentication URLs
    path('signup/', views.signup, name='signup'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),

    # CSRF Token URL
    path('get-csrf-token/', views.get_csrf_token, name='get_csrf_token'),

    # Dashboard and Group Management URLs
    path('', views.index, name='index'),  # Home/Dashboard
    path('add-group/', views.add_group, name='add_group'),  # Add a new group
    path('delete-group/<int:group_id>/', views.delete_group, name='delete_group'),  # Delete a group
    path('group/<int:group_id>/', views.group_detail, name='group_detail'),  # Group detail page (for managing links)
    path('add_link/<int:group_id>/', views.add_link, name='add_link'),
    path('edit_link/<int:link_id>/', views.edit_link, name='edit_link'),
    path('delete_link/<int:link_id>/', views.delete_link, name='delete_link'),
    path('public/<int:group_id>/', views.public_link_page, name='public_link_page'),
    path('update_link_order/<int:group_id>/', views.update_link_order, name='update_link_order'),
    path('update_group/<int:group_id>/', views.update_group, name='update_group'),
    path('analytics/<int:group_id>/', views.analytics, name='analytics'),
]