<nav class="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
    <!-- Sidebar Toggle (Topbar) -->
    <button id="sidebarToggleTop" class="btn btn-link d-md-none rounded-circle mr-3">
        <i class="fa fa-bars"></i>
    </button>
    
    <!-- Topbar Navbar -->
    <ul class="navbar-nav ml-auto">
        <div class="topbar-divider d-none d-sm-block"></div>
        
        <!-- Nav Item - User Information -->
        
        <li class="nav-item dropdown no-arrow">
            <a class="nav-link dropdown-toggle" href="Carrito.php" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <div class="notification-container">
                    <i class="icon-globe"></i>
                    <span class="notification-counter">0</span>
                </div>
                <i class="fas fa-shopping-cart"></i>
            </a>
        </li>
        <div class="topbar-divider d-none d-sm-block"></div>
        <li class="nav-item dropdown no-arrow">
            <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <span class="mr-2 d-none d-lg-inline text-gray-600 small"><?php echo $_SESSION['nombre']; ?></span>
                <img class="img-profile rounded-circle" src="/img/e.png">
            </a>
            <!-- Dropdown - User Information -->
            <div class="dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="userDropdown">
                <a class="dropdown-item" href="logout.php" data-toggle="modal" data-target="#logoutModal">
                    <i class="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                    Cerrar Sesi&oacute;n
                </a>
            </div>
        </li>
    </ul>
</nav>