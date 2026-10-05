package com.sampath.digitalstore_backend.config;

import com.sampath.digitalstore_backend.entity.*;
import com.sampath.digitalstore_backend.repository.*;
import com.sampath.digitalstore_backend.util.Constants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;

/**
 * Fills an empty database with demo accounts, products, orders, reviews and a cart.
 * Enabled only with app.seed.enabled=true (env SEED_DATA=true). Never enable this in production:
 * the demo accounts share a well-known password.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.seed.enabled", havingValue = "true")
public class DemoDataSeeder implements CommandLineRunner {

    public static final String DEMO_PASSWORD = "password123";

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.files-dir}")
    private String filesDir;

    private record ProductSeed(String key, String title, String type, String price, String seller, boolean published, String description) {
    }

    private static final List<ProductSeed> PRODUCTS = List.of(
            // Ebooks
            new ProductSeed("founder", "The Indie Founder Playbook", "EBOOK", "19.00", "ava", true,
                    "A practical, no-fluff guide to launching a profitable one-person business. Covers finding a niche, validating ideas in a weekend, pricing, your first 100 customers and building systems so the business runs without you.\n\n180 pages, 12 chapters, plus worksheets."),
            new ProductSeed("cleancode", "Clean Code in Practice", "EBOOK", "24.00", "leo", true,
                    "Real-world refactoring examples in Java and TypeScript. Learn to name things well, keep functions small, write tests that document behaviour and untangle legacy code one safe step at a time."),
            new ProductSeed("calm", "Designing Calm Interfaces", "EBOOK", "17.50", "ava", true,
                    "How to design products that respect attention. Patterns for notifications, empty states, onboarding and dark mode, with before-and-after case studies from popular apps."),
            new ProductSeed("finance", "Personal Finance for Freelancers", "EBOOK", "12.00", "leo", true,
                    "Irregular income, taxes, invoices and retirement explained simply. Includes a budgeting system built for freelancers and a checklist for your first year of self-employment."),
            new ProductSeed("remote", "The Remote Work Handbook", "EBOOK", "9.99", "ava", true,
                    "Everything teams need to work well across time zones: async communication, meeting hygiene, documentation habits and how to stay connected without burning out."),
            // Courses
            new ProductSeed("photo", "Mastering Photography: Auto to Manual", "COURSE", "49.00", "ava", true,
                    "Take full control of your camera in 24 short video lessons. Exposure, composition, natural light and editing, with weekly photo assignments and feedback checklists."),
            new ProductSeed("spring", "Spring Boot APIs from Scratch", "COURSE", "59.00", "leo", true,
                    "Build a production-ready REST API with Spring Boot 3, JPA, PostgreSQL and JWT security. You will ship a complete project with validation, error handling, tests and Stripe payments."),
            new ProductSeed("nextjs", "Next.js 14 Full-Stack Bootcamp", "COURSE", "69.00", "leo", true,
                    "From the App Router to server actions, data fetching and deployment. Build three real apps and learn the patterns used by modern product teams."),
            new ProductSeed("watercolor", "Watercolor Basics in 30 Days", "COURSE", "29.00", "ava", true,
                    "A relaxing, beginner-friendly course: one 15-minute lesson a day. Learn washes, layering, colour mixing and simple landscapes using just six paints."),
            // Digital files
            new ProductSeed("uikit", "UI Starter Kit for Figma", "DIGITAL_FILE", "24.00", "ava", true,
                    "120+ components, 40 ready-made screens and a complete design token system. Light and dark themes, auto layout everywhere, free updates."),
            new ProductSeed("notion", "Notion Life OS Template", "DIGITAL_FILE", "14.00", "leo", true,
                    "Organise goals, habits, projects and notes in one connected workspace. Includes a weekly review dashboard and a step-by-step setup guide."),
            new ProductSeed("presets", "Lightroom Presets: Golden Hour", "DIGITAL_FILE", "11.00", "ava", true,
                    "15 warm, film-inspired presets for desktop and mobile Lightroom. Tuned for portraits and travel photos, with a guide to adjusting them for any light."),
            // Draft, so the seller studio has something unpublished to show
            new ProductSeed("k8s", "Kubernetes Field Guide", "EBOOK", "21.00", "leo", false,
                    "Work in progress: a field guide to running Kubernetes in production, from deployments and autoscaling to debugging at 3 a.m.")
    );

    @Override
    @Transactional
    public void run(String... args) throws IOException {
        if (userRepository.existsByEmail("ava@demo.store")) {
            log.info("Demo data already present, skipping seed");
            return;
        }

        Map<String, User> users = new HashMap<>();
        users.put("admin", createUser("Demo Admin", "admin@demo.store", Role.ADMIN));
        users.put("ava", createUser("Ava Martin", "ava@demo.store", Role.SELLER));
        users.put("leo", createUser("Leo Park", "leo@demo.store", Role.SELLER));
        users.put("buyer", createUser("Sam Rivera", "buyer@demo.store", Role.USER));
        users.put("mia", createUser("Mia Chen", "mia@demo.store", Role.USER));
        users.put("noah", createUser("Noah Okafor", "noah@demo.store", Role.USER));

        Path dir = Path.of(filesDir);
        Files.createDirectories(dir);

        Map<String, Product> products = new LinkedHashMap<>();
        for (ProductSeed seed : PRODUCTS) {
            products.put(seed.key(), createProduct(seed, users.get(seed.seller()), dir));
        }

        // Paid orders unlock downloads and allow reviews
        createOrder(users.get("buyer"), OrderStatus.PAID, products, "founder", "spring", "uikit");
        createOrder(users.get("buyer"), OrderStatus.PENDING, products, "photo");
        createOrder(users.get("buyer"), OrderStatus.FAILED, products, "notion");
        createOrder(users.get("mia"), OrderStatus.PAID, products, "founder", "photo", "notion", "calm");
        createOrder(users.get("noah"), OrderStatus.PAID, products, "cleancode", "spring", "nextjs", "presets", "founder");

        review(users.get("buyer"), products.get("founder"), 5, "Straight to the point. I validated my idea in a weekend using chapter 3.");
        review(users.get("buyer"), products.get("spring"), 4, "Very thorough. The security module alone was worth it. Would love a section on caching.");
        review(users.get("mia"), products.get("founder"), 5, "The pricing chapter changed how I think about my product. Highly recommend.");
        review(users.get("mia"), products.get("photo"), 5, "Finally understand exposure! The weekly assignments keep you honest.");
        review(users.get("mia"), products.get("notion"), 4, "Beautiful template, took about 20 minutes to set up with the guide.");
        review(users.get("mia"), products.get("calm"), 4, "Lovely examples. The notification patterns were immediately useful at work.");
        review(users.get("noah"), products.get("cleancode"), 4, "Great refactoring walkthroughs, especially the legacy code chapter.");
        review(users.get("noah"), products.get("spring"), 5, "Best Spring Boot course I have taken. The Stripe integration was a bonus.");
        review(users.get("noah"), products.get("nextjs"), 4, "Covers the App Router really well. Fast-paced but clear.");
        review(users.get("noah"), products.get("presets"), 3, "Nice look for sunsets, needs tweaking for indoor shots.");
        review(users.get("noah"), products.get("founder"), 4, "Solid, actionable advice. A few chapters felt short.");

        Cart cart = Cart.builder().user(users.get("buyer")).build();
        addToCart(cart, products.get("nextjs"));
        addToCart(cart, products.get("finance"));
        cartRepository.save(cart);

        log.info("Seeded demo data: {} users, {} products. Sign in with buyer@demo.store / {}",
                users.size(), products.size(), DEMO_PASSWORD);
    }

    private User createUser(String name, String email, Role role) {
        return userRepository.save(User.builder()
                .name(name)
                .email(email)
                .password(passwordEncoder.encode(DEMO_PASSWORD))
                .role(role)
                .build());
    }

    private Product createProduct(ProductSeed seed, User seller, Path dir) throws IOException {
        Path file = dir.resolve(seed.key() + ".pdf");
        Files.write(file, simplePdf(seed.title(), List.of(
                "Thank you for your purchase!",
                "",
                "This is a demo file from Digital Store.",
                "In a real store, the full " + seed.type().toLowerCase().replace('_', ' ') + " would be here.")));

        return productRepository.save(Product.builder()
                .title(seed.title())
                .description(seed.description())
                .price(new BigDecimal(seed.price()))
                .productType(seed.type())
                // Generated by frontend/scripts/generate-covers.mjs, served from frontend/public/covers
                .thumbnailUrl("/covers/" + seed.key() + ".svg")
                .fileUrl(file.toAbsolutePath().toString())
                .seller(seller)
                .isPublished(seed.published())
                .build());
    }

    private void createOrder(User user, OrderStatus status, Map<String, Product> products, String... keys) {
        Order order = Order.builder()
                .orderNumber(UUID.randomUUID().toString())
                .user(user)
                .status(status)
                .build();

        BigDecimal total = BigDecimal.ZERO;
        for (String key : keys) {
            Product product = products.get(key);
            BigDecimal fee = product.getPrice().multiply(Constants.PLATFORM_FEE_RATE)
                    .setScale(Constants.MONEY_SCALE, RoundingMode.HALF_UP);
            order.addItem(OrderItem.builder()
                    .product(product)
                    .priceAtPurchase(product.getPrice())
                    .quantity(1)
                    .platformFee(fee)
                    .sellerEarnings(product.getPrice().subtract(fee))
                    .build());
            total = total.add(product.getPrice());
        }
        order.setTotalAmount(total);
        orderRepository.save(order);
    }

    private void review(User user, Product product, int rating, String comment) {
        reviewRepository.save(Review.builder().user(user).product(product).rating(rating).comment(comment).build());
    }

    private void addToCart(Cart cart, Product product) {
        cart.getItems().add(CartItem.builder()
                .cart(cart)
                .product(product)
                .quantity(1)
                .priceSnapshot(product.getPrice())
                .build());
    }

    // Minimal one-page PDF (Helvetica text), so demo downloads open in any viewer
    private static byte[] simplePdf(String title, List<String> lines) {
        StringBuilder content = new StringBuilder("BT /F1 22 Tf 72 720 Td (" + escape(title) + ") Tj ET\n");
        int y = 680;
        for (String line : lines) {
            content.append("BT /F1 12 Tf 72 ").append(y).append(" Td (").append(escape(line)).append(") Tj ET\n");
            y -= 18;
        }
        String stream = content.toString();

        List<String> objects = List.of(
                "<< /Type /Catalog /Pages 2 0 R >>",
                "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
                "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
                "<< /Length " + stream.length() + " >>\nstream\n" + stream + "endstream",
                "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

        StringBuilder pdf = new StringBuilder("%PDF-1.4\n");
        List<Integer> offsets = new ArrayList<>();
        for (int i = 0; i < objects.size(); i++) {
            offsets.add(pdf.length());
            pdf.append(i + 1).append(" 0 obj\n").append(objects.get(i)).append("\nendobj\n");
        }
        int xref = pdf.length();
        pdf.append("xref\n0 ").append(objects.size() + 1).append("\n0000000000 65535 f \n");
        offsets.forEach(offset -> pdf.append(String.format("%010d 00000 n \n", offset)));
        pdf.append("trailer\n<< /Size ").append(objects.size() + 1).append(" /Root 1 0 R >>\nstartxref\n")
                .append(xref).append("\n%%EOF\n");

        return pdf.toString().getBytes(StandardCharsets.US_ASCII);
    }

    private static String escape(String text) {
        return text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)");
    }
}
