import React from 'react';

const HomePage = React.lazy(() => import('Pages/HomePage/HomePage'));
const ViewPromotion = React.lazy(() =>
  import('Pages/PromotionPage/ViewPromotion/ViewPromotion')
);
const LoginPage = React.lazy(() => import('Pages/LoginPage/LoginPage'));

const PatientPage = React.lazy(() => import('Pages/PatientPage/PatientPage'));
const PatientDetailPage = React.lazy(() =>
  import('Pages/PatientPage/PatientDetailPage/PatientDetailPage')
);
const PatientDepentPage = React.lazy(() =>
  import('Pages/PatientPage/PatientDepentPage/PatientDepentPage')
);
const PatientMedicalPage = React.lazy(() =>
  import('Pages/PatientPage/PatientMedicalPage/PatientMedicalPage')
);

const DoctorPage = React.lazy(() => import('Pages/DoctorPage/DoctorPage'));
const DoctorDetailsPage = React.lazy(() =>
  import('Pages/DoctorPage/DoctorDetailsPage/DoctorDetailsPage')
);
const DoctorSchedulePage = React.lazy(() =>
  import('Pages/DoctorPage/DoctorSchedulePage/DoctorSchedulePage')
);
const TimeSlotPage = React.lazy(() =>
  import('Pages/TimeSlotPage/TimeSlotPage')
);
const CreateTimeslotPage = React.lazy(() =>
  import('Pages/TimeSlotPage/CreateTimeslotPage/CreateTimeslotPage')
);
const AppointmentPage = React.lazy(() =>
  import('Pages/AppointmentPage/AppointmentPage')
);
const AppointmentDetailPage = React.lazy(() =>
  import('Pages/AppointmentPage/AppointmentDetailPage/AppointmentDetailpage')
);
const AppointmentBookingPage = React.lazy(() =>
  import('Pages/AppointmentPage/AppointmentBookingPage/AppointmentBookingPage')
);
const UserPermissionPage = React.lazy(() =>
  import('Pages/PermissionPage/UserPermissionPage/UserPermissionPage')
);
const GroupPermissionPage = React.lazy(() =>
  import('Pages/PermissionPage/GroupPermissionPage/GroupPermissionPage')
);
const PermissionPage = React.lazy(() =>
  import('Pages/PermissionPage/PermissionPage/PermissionPage')
);
const PromotionPage = React.lazy(() => import('Pages/PromotionPage/Promotion'));

const CreatePromotionPage = React.lazy(() =>
  import('Pages/PromotionPage/CreatePromotion/CreatePromotion')
);
const EditPromotionPage = React.lazy(() =>
  import('Pages/PromotionPage/CreatePromotion/CreatePromotion')
);
const ContentPage = React.lazy(() => import('Pages/ContentPage/ContentPage'));
const BannerPage = React.lazy(() => import('Pages/BannerPage/BannerPage'));

const NotFoundPage = React.lazy(() =>
  import('Pages/NotFoundPage/NotFoundPage')
);

const routes = [
  {
    path: '/',
    exact: true,
    component: HomePage,
    // isPrivate: true,
  },
  {
    path: '/login',
    exact: true,
    component: LoginPage,
  },
  {
    path: '/admin',
    exact: true,
    component: HomePage,
    // isPrivate: true,
  },
  {
    path: '/promotion/:id/:lang',
    exact: true,
    component: ViewPromotion,
    // isPrivate: true,
  },
  {
    path: '/admin/patient',
    exact: true,
    component: PatientPage,
    isPrivate: true,
  },
  {
    path: '/admin/patient/detail/:id',
    exact: true,
    component: PatientDetailPage,
    isPrivate: true,
  },
  {
    path: '/admin/patient/depent/:id',
    exact: true,
    component: PatientDepentPage,
    isPrivate: true,
  },
  {
    path: '/admin/patient/medical-records/:id',
    exact: true,
    component: PatientMedicalPage,
    isPrivate: true,
  },

  {
    path: '/admin/doctor',
    exact: true,
    component: DoctorPage,
    isPrivate: true,
  },
  {
    path: '/admin/doctor/detail/:id',
    exact: true,
    component: DoctorDetailsPage,
    isPrivate: true,
  },
  {
    path: '/admin/doctor/schedule/:id',
    exact: true,
    component: DoctorSchedulePage,
    isPrivate: true,
  },
  {
    path: '/admin/timeslot',
    exact: true,
    component: TimeSlotPage,
    isPrivate: true,
  },
  {
    path: '/admin/timeslot/create',
    exact: true,
    component: CreateTimeslotPage,
    isPrivate: true,
  },
  {
    path: '/admin/appointment',
    exact: true,
    component: AppointmentPage,
    isPrivate: true,
  },
  {
    path: '/admin/appointment-detail/:id',
    exact: true,
    component: AppointmentDetailPage,
    isPrivate: true,
  },
  {
    path: '/admin/appointment/create/booking',
    exact: true,
    component: AppointmentBookingPage,
    isPrivate: true,
  },
  {
    path: '/admin/appointment/edit/:id',
    exact: true,
    component: AppointmentBookingPage,
    isPrivate: true,
  },
  {
    path: '/admin/promotion',
    exact: true,
    component: PromotionPage,
    isPrivate: true,
  },
  {
    path: '/admin/promotion/create',
    exact: true,
    component: CreatePromotionPage,
    isPrivate: true,
  },
  {
    path: '/admin/promotion/edit/:id',
    exact: true,
    component: EditPromotionPage,
    isPrivate: true,
  },
  {
    path: '/admin/content',
    exact: true,
    component: ContentPage,
    isPrivate: true,
  },
  {
    path: '/admin/permission/user',
    exact: true,
    component: UserPermissionPage,
    isPrivate: true,
  },
  {
    path: '/admin/permission/group',
    exact: true,
    component: GroupPermissionPage,
    isPrivate: true,
  },
  {
    path: '/admin/permission/edit/:name/:id',
    exact: true,
    component: PermissionPage,
    isPrivate: true,
  },
  {
    path: '/admin/permission/add/:name/',
    exact: true,
    component: PermissionPage,
    isPrivate: true,
  },
  {
    path: '/admin/banner',
    exact: true,
    component: BannerPage,
    isPrivate: true,
  },
  {
    path: '',
    component: NotFoundPage,
  },
];

export default routes;
