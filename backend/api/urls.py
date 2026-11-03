from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    login_view, register_view, me_view, technicians_list_view,
    college_layout_tree, dashboard_stats_view,
    UserViewSet, BuildingViewSet, FloorViewSet, RoomViewSet,
    EquipmentViewSet, ComplaintViewSet
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='users')
router.register(r'buildings', BuildingViewSet, basename='buildings')
router.register(r'floors', FloorViewSet, basename='floors')
router.register(r'rooms', RoomViewSet, basename='rooms')
router.register(r'equipment', EquipmentViewSet, basename='equipment')
router.register(r'complaints', ComplaintViewSet, basename='complaints')

urlpatterns = [
    # Auth
    path('auth/register/', register_view, name='register'),
    path('auth/login/', login_view, name='login'),
    path('auth/me/', me_view, name='me'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Custom helper endpoints
    path('technicians/', technicians_list_view, name='technicians_list'),
    path('layout/tree/', college_layout_tree, name='layout_tree'),
    path('dashboard/stats/', dashboard_stats_view, name='dashboard_stats'),

    # Router endpoints
    path('', include(router.urls)),
]
